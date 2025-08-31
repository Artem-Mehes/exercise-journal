import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const get = query({
	handler: async (ctx) => {
		const exercises = await ctx.db.query("exercises").collect();

		// Fetch muscle group info for each exercise
		const exercisesWithMuscleGroups = await Promise.all(
			exercises.map(async (exercise) => {
				if (!exercise.muscleGroupId) {
					return {
						...exercise,
						muscleGroup: null,
					};
				}

				const muscleGroup = await ctx.db.get(exercise.muscleGroupId);
				return {
					...exercise,
					muscleGroup,
				};
			}),
		);

		return exercisesWithMuscleGroups;
	},
});

export const getById = query({
	args: {
		exerciseId: v.id("exercises"),
	},
	handler: async (ctx, args) => {
		const exercise = await ctx.db.get(args.exerciseId);
		if (!exercise) {
			return null;
		}

		// Handle the nested sets structure - get the last workout's sets
		let lastWorkoutSets: Doc<"sets">[] = [];
		if (exercise.sets && exercise.sets.length > 0) {
			// Get the last inner array (most recent workout)
			const lastWorkoutSetIds = exercise.sets[exercise.sets.length - 1];

			// Fetch the actual set documents
			const sets = await Promise.all(
				lastWorkoutSetIds.map((setId) => ctx.db.get(setId)),
			);

			// Filter out any null sets
			lastWorkoutSets = sets.filter((set) => set !== null);
		}

		// Fetch muscle group info
		const muscleGroup = exercise.muscleGroupId
			? await ctx.db.get(exercise.muscleGroupId)
			: null;

		return {
			...exercise,
			muscleGroup,
			sets: lastWorkoutSets, // This now contains sets from the last workout only
		};
	},
});

export const getByMuscleGroup = query({
	args: {
		muscleGroupId: v.id("muscleGroups"),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("exercises")
			.withIndex("muscleGroupId", (q) =>
				q.eq("muscleGroupId", args.muscleGroupId),
			)
			.collect();
	},
});

export const getCurrentWorkoutSets = query({
	args: {
		exerciseId: v.id("exercises"),
	},
	handler: async (ctx, args) => {
		// Get current active workout
		const currentWorkout = await ctx.db
			.query("workouts")
			.filter((q) => q.eq(q.field("endTime"), undefined))
			.first();

		if (!currentWorkout) {
			return [];
		}

		const exercise = await ctx.db.get(args.exerciseId);
		if (!exercise || !exercise.sets || exercise.sets.length === 0) {
			return [];
		}

		// Get the last workout session sets and check if they belong to current workout
		const lastWorkoutSetIds = exercise.sets[exercise.sets.length - 1];

		if (lastWorkoutSetIds.length === 0) {
			return [];
		}

		// Get the first set to check if it was created after current workout started
		const firstSet = await ctx.db.get(lastWorkoutSetIds[0]);

		if (firstSet && firstSet._creationTime >= currentWorkout.startTime) {
			// These sets belong to the current workout
			const sets = await Promise.all(
				lastWorkoutSetIds.map((setId) => ctx.db.get(setId)),
			);
			return sets.filter((set) => set !== null);
		}

		return [];
	},
});

export const getLastCompletedWorkoutSets = query({
	args: {
		exerciseId: v.id("exercises"),
	},
	handler: async (ctx, args) => {
		const exercise = await ctx.db.get(args.exerciseId);
		if (!exercise || !exercise.sets || exercise.sets.length === 0) {
			return [];
		}

		// Get current active workout to determine which sets are from current session
		const currentWorkout = await ctx.db
			.query("workouts")
			.filter((q) => q.eq(q.field("endTime"), undefined))
			.first();

		const lastWorkoutSetIds = exercise.sets[exercise.sets.length - 1];

		if (currentWorkout && lastWorkoutSetIds.length > 0) {
			// Check if the last workout session is the current one
			const firstSet = await ctx.db.get(lastWorkoutSetIds[0]);

			if (firstSet && firstSet._creationTime >= currentWorkout.startTime) {
				// Last session is current, get the previous one if it exists
				if (exercise.sets.length > 1) {
					const previousWorkoutSetIds = exercise.sets[exercise.sets.length - 2];
					const sets = await Promise.all(
						previousWorkoutSetIds.map((setId) => ctx.db.get(setId)),
					);
					return sets.filter((set) => set !== null);
				}
				return [];
			}
		}

		// Last session is completed, return it
		const sets = await Promise.all(
			lastWorkoutSetIds.map((setId) => ctx.db.get(setId)),
		);
		return sets.filter((set) => set !== null);
	},
});

export const create = mutation({
	args: {
		name: v.string(),
		muscleGroupId: v.id("muscleGroups"),
	},
	handler: async (ctx, args) => {
		// Create the exercise
		const exerciseId = await ctx.db.insert("exercises", args);

		// Add the exercise to the muscle group's exercises array
		const muscleGroup = await ctx.db.get(args.muscleGroupId);
		if (muscleGroup) {
			const currentExercises = muscleGroup.exercises || [];
			await ctx.db.patch(args.muscleGroupId, {
				exercises: [...currentExercises, exerciseId],
			});
		}

		return exerciseId;
	},
});

export const updateNotes = mutation({
	args: {
		exerciseId: v.id("exercises"),
		notes: v.string(),
	},
	handler: async (ctx, args) => {
		const exercise = await ctx.db.get(args.exerciseId);
		if (!exercise) {
			throw new Error("Exercise not found");
		}

		await ctx.db.patch(args.exerciseId, {
			notes: args.notes.trim() || undefined, // Store undefined if empty string
		});

		return args.exerciseId;
	},
});

export const addSet = mutation({
	args: {
		exerciseId: v.id("exercises"),
		count: v.number(),
		weight: v.number(),
	},
	handler: async (ctx, args) => {
		// Check if there's an active workout first
		const currentWorkout = await ctx.db
			.query("workouts")
			.filter((q) => q.eq(q.field("endTime"), undefined))
			.first();

		if (!currentWorkout) {
			throw new Error("No active workout. Please start a workout first.");
		}

		const exercise = await ctx.db.get(args.exerciseId);
		if (!exercise) {
			throw new Error("Exercise not found");
		}

		// Create new set document
		const setId = await ctx.db.insert("sets", {
			exerciseId: args.exerciseId,
			count: args.count,
			weight: args.weight,
		});

		// Handle the nested array structure for sets
		const currentSets = exercise.sets || [];
		let updatedSets: typeof currentSets;

		let isNewExerciseInWorkout = false;

		if (currentSets.length === 0) {
			// First workout session ever for this exercise
			updatedSets = [[setId]];
			isNewExerciseInWorkout = true;
		} else {
			// Check if we need to start a new workout session by comparing workout start time
			// with the creation time of the last set in the last workout session
			const lastWorkoutSetIds = currentSets[currentSets.length - 1];

			if (lastWorkoutSetIds.length > 0) {
				// Get the last set to check its creation time
				const lastSet = await ctx.db.get(
					lastWorkoutSetIds[lastWorkoutSetIds.length - 1],
				);

				if (lastSet && currentWorkout.startTime > lastSet._creationTime) {
					// Current workout started after the last set was created
					// This means we should start a new workout session
					updatedSets = [...currentSets, [setId]];
					isNewExerciseInWorkout = true;
				} else {
					// Add to the current workout session
					const updatedLastSession = [...lastWorkoutSetIds, setId];
					updatedSets = [...currentSets.slice(0, -1), updatedLastSession];
				}
			} else {
				// Edge case: empty last session, add to it
				const updatedLastSession = [setId];
				updatedSets = [...currentSets.slice(0, -1), updatedLastSession];
			}
		}

		await ctx.db.patch(args.exerciseId, {
			sets: updatedSets,
		});

		// Track this exercise in the current workout if it's the first set of this exercise in this workout
		if (isNewExerciseInWorkout) {
			const workoutExercises = currentWorkout.exercises || [];
			if (!workoutExercises.includes(args.exerciseId)) {
				await ctx.db.patch(currentWorkout._id, {
					exercises: [...workoutExercises, args.exerciseId],
				});
			}
		}

		return setId;
	},
});

export const deleteSet = mutation({
	args: {
		setId: v.id("sets"),
	},
	handler: async (ctx, args) => {
		// Get the set to find which exercise it belongs to
		const set = await ctx.db.get(args.setId);
		if (!set) {
			throw new Error("Set not found");
		}

		const exercise = await ctx.db.get(set.exerciseId);
		if (!exercise) {
			throw new Error("Exercise not found");
		}

		// Remove set ID from exercise's nested sets array
		const updatedSets =
			exercise.sets
				?.map((workoutSets) =>
					workoutSets.filter((setId) => setId !== args.setId),
				)
				.filter((workoutSets) => workoutSets.length > 0) || []; // Remove empty workout sessions

		await ctx.db.patch(set.exerciseId, {
			sets: updatedSets,
		});

		// Delete the set document
		await ctx.db.delete(args.setId);

		return set.exerciseId;
	},
});

export const deleteExercise = mutation({
	args: {
		exerciseId: v.id("exercises"),
	},
	handler: async (ctx, args) => {
		const exercise = await ctx.db.get(args.exerciseId);
		if (!exercise) {
			throw new Error("Exercise not found");
		}

		// Remove the exercise from the muscle group's exercises array
		const muscleGroup = await ctx.db.get(exercise.muscleGroupId);
		if (muscleGroup) {
			const updatedExercises = (muscleGroup.exercises || []).filter(
				(id) => id !== args.exerciseId,
			);
			await ctx.db.patch(exercise.muscleGroupId, {
				exercises: updatedExercises,
			});
		}

		// Delete all sets associated with this exercise
		if (exercise.sets) {
			for (const workoutSets of exercise.sets) {
				for (const setId of workoutSets) {
					await ctx.db.delete(setId);
				}
			}
		}

		// Delete the exercise
		await ctx.db.delete(args.exerciseId);

		return args.exerciseId;
	},
});
