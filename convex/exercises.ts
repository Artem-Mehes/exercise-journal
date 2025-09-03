import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const get = query({
	handler: async (ctx) => {
		const exercises = await ctx.db.query("exercises").collect();

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

		const muscleGroup = exercise.muscleGroupId
			? await ctx.db.get(exercise.muscleGroupId)
			: null;

		return {
			...exercise,
			muscleGroup,
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
		const finishedWorkouts = await ctx.db
			.query("workouts")
			.filter((q) => q.neq(q.field("endTime"), undefined))
			.collect();

		const lastFinishedWorkout = finishedWorkouts[finishedWorkouts.length - 1];

		if (!lastFinishedWorkout) {
			return [];
		}

		const sets = await ctx.db
			.query("sets")
			.filter((q) => q.eq(q.field("workoutId"), lastFinishedWorkout._id))
			.filter((q) => q.eq(q.field("exerciseId"), args.exerciseId))
			.collect();

		return sets;
	},
});

export const create = mutation({
	args: {
		name: v.string(),
		muscleGroupId: v.id("muscleGroups"),
	},
	handler: async (ctx, args) => {
		const exerciseId = await ctx.db.insert("exercises", args);

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

		const setId = await ctx.db.insert("sets", {
			exerciseId: args.exerciseId,
			count: args.count,
			weight: args.weight,
			workoutId: currentWorkout._id,
		});

		return setId;
	},
});

export const deleteSet = mutation({
	args: {
		setId: v.id("sets"),
	},
	handler: async (ctx, args) => {
		const set = await ctx.db.get(args.setId);
		if (!set) {
			throw new Error("Set not found");
		}

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
