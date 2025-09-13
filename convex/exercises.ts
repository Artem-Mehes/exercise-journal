import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const get = query({
	handler: async (ctx) => {
		const exercises = await ctx.db.query("exercises").collect();

		const exercisesWithMuscleGroups = await Promise.all(
			exercises.map(async (exercise) => {
				if (!exercise.groupId) {
					return {
						...exercise,
						muscleGroup: null,
					};
				}

				const muscleGroup = await ctx.db.get(exercise.groupId);
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

		const muscleGroup = exercise.groupId
			? await ctx.db.get(exercise.groupId)
			: null;

		return {
			...exercise,
			muscleGroup,
		};
	},
});

export const getByMuscleGroup = query({
	args: {
		groupId: v.id("exerciseGroups"),
	},
	handler: async (ctx, args) => {
		const currentWorkout = await ctx.db
			.query("workouts")
			.filter((q) => q.eq(q.field("endTime"), undefined))
			.first();

		const exercises = await ctx.db
			.query("exercises")
			.withIndex("groupId", (q) => q.eq("groupId", args.groupId))
			.collect();

		let resultExercises: (Doc<"exercises"> & { isFinished?: boolean })[] =
			exercises;

		if (currentWorkout) {
			resultExercises = await Promise.all(
				exercises.map(async (exercise) => {
					const sets = await ctx.db
						.query("sets")
						.withIndex("workoutId_exerciseId", (q) =>
							q
								.eq("workoutId", currentWorkout._id)
								.eq("exerciseId", exercise._id),
						)
						.collect();

					return {
						...exercise,
						isFinished: exercise.setsGoal
							? sets.length >= exercise.setsGoal
							: false,
					};
				}),
			);
		}

		return resultExercises;
	},
});

export const getCurrentWorkoutSetsForExercise = query({
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

		const sets = await ctx.db
			.query("sets")
			.withIndex("workoutId_exerciseId", (q) =>
				q.eq("workoutId", currentWorkout._id).eq("exerciseId", args.exerciseId),
			)
			.collect();

		return sets;
	},
});

export const getLastCompletedWorkoutSets = query({
	args: {
		exerciseId: v.id("exercises"),
	},
	handler: async (ctx, args) => {
		const setsForExercise = await ctx.db
			.query("sets")
			.withIndex("exerciseId", (q) => q.eq("exerciseId", args.exerciseId))
			.order("desc")
			.collect();

		let lastWorkoutIdWithSetsForExercise = "";

		const resultSets: Doc<"sets">[] = [];

		for (const set of setsForExercise) {
			const workout = await ctx.db.get(set.workoutId);

			if (!workout || !workout.endTime) {
				continue;
			}

			if (!lastWorkoutIdWithSetsForExercise) {
				lastWorkoutIdWithSetsForExercise = set.workoutId;
				resultSets.push(set);
			} else if (set.workoutId === lastWorkoutIdWithSetsForExercise) {
				resultSets.push(set);
			} else {
				break;
			}
		}

		return resultSets.reverse();
	},
});

const formatExerciseName = (name: string): string => {
	return name
		.toLowerCase()
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
};

export const create = mutation({
	args: {
		name: v.string(),
		groupId: v.id("exerciseGroups"),
		setsGoal: v.number(),
	},
	handler: async (ctx, args) => {
		const formattedName = formatExerciseName(args.name);
		const exerciseId = await ctx.db.insert("exercises", {
			...args,
			name: formattedName,
		});

		return exerciseId;
	},
});

export const update = mutation({
	args: {
		exerciseId: v.id("exercises"),
		name: v.string(),
		groupId: v.id("exerciseGroups"),
		setsGoal: v.number(),
		barbellId: v.optional(v.id("barbells")),
	},
	handler: async (ctx, args) => {
		const exercise = await ctx.db.get(args.exerciseId);
		if (!exercise) {
			throw new Error("Exercise not found");
		}

		const { exerciseId, ...updates } = args;
		await ctx.db.patch(exerciseId, {
			...updates,
			name: formatExerciseName(updates.name),
		});

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

export const deleteExercise = mutation({
	args: {
		exerciseId: v.id("exercises"),
	},
	handler: async (ctx, args) => {
		const exercise = await ctx.db.get(args.exerciseId);
		if (!exercise) {
			throw new Error("Exercise not found");
		}

		const setsForExercise = await ctx.db
			.query("sets")
			.withIndex("exerciseId", (q) => q.eq("exerciseId", args.exerciseId))
			.collect();

		for (const set of setsForExercise) {
			await ctx.db.delete(set._id);
		}

		await ctx.db.delete(args.exerciseId);

		return args.exerciseId;
	},
});

export const getSummary = query({
	args: {
		exerciseId: v.id("exercises"),
	},
	handler: async (ctx, args) => {
		const exercise = await ctx.db.get(args.exerciseId);

		if (!exercise) {
			throw new Error("Exercise not found");
		}

		const allSets = await ctx.db
			.query("sets")
			.withIndex("exerciseId", (q) => q.eq("exerciseId", args.exerciseId))
			.collect();

		if (allSets.length === 0) {
			return {
				bestSet: null,
			};
		}

		const bestSet = {
			byVolume: {
				count: 0,
				weight: 0,
			},
		};

		let biggestSetVolume = 0;
		let maxWeight = 0;

		for (const set of allSets) {
			const volume = set.count * set.weight;
			const weight = set.weight;

			if (weight > maxWeight) {
				maxWeight = weight;
			}

			if (volume > biggestSetVolume) {
				biggestSetVolume = volume;
				bestSet.byVolume = {
					count: set.count,
					weight: set.weight,
				};
			}
		}

		return {
			bestSet,
			maxWeight,
		};
	},
});
