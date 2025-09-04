import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const startWorkout = mutation({
	handler: async (ctx) => {
		// Check if there's already an active workout (one without endTime)
		const activeWorkout = await ctx.db
			.query("workouts")
			.filter((q) => q.eq(q.field("endTime"), undefined))
			.first();

		if (activeWorkout) {
			throw new Error("A workout is already in progress");
		}

		// Create new workout
		const workoutId = await ctx.db.insert("workouts", {
			startTime: Date.now(),
		});

		return workoutId;
	},
});

export const endWorkout = mutation({
	args: {
		workoutId: v.id("workouts"),
	},
	handler: async (ctx, args) => {
		const workout = await ctx.db.get(args.workoutId);
		if (!workout) {
			throw new Error("Workout not found");
		}

		if (workout.endTime) {
			throw new Error("Workout is already ended");
		}

		// Set endTime instead of deleting
		await ctx.db.patch(args.workoutId, {
			endTime: Date.now(),
		});

		return args.workoutId;
	},
});

export const getCurrentWorkout = query({
	handler: async (ctx) => {
		// Find the active workout (one without endTime)
		const activeWorkout = await ctx.db
			.query("workouts")
			.filter((q) => q.eq(q.field("endTime"), undefined))
			.first();

		if (!activeWorkout) {
			return null;
		}

		return activeWorkout;
	},
});

export const endCurrentWorkout = mutation({
	handler: async (ctx) => {
		// Find the active workout (one without endTime)
		const activeWorkout = await ctx.db
			.query("workouts")
			.filter((q) => q.eq(q.field("endTime"), undefined))
			.first();

		if (!activeWorkout) {
			throw new Error("No active workout found");
		}

		await ctx.db.patch(activeWorkout._id, {
			endTime: Date.now(),
		});

		return activeWorkout._id;
	},
});

export const getCurrentWorkoutExercises = query({
	handler: async (ctx) => {
		const activeWorkout = await ctx.db
			.query("workouts")
			.filter((q) => q.eq(q.field("endTime"), undefined))
			.first();

		if (!activeWorkout) {
			return {};
		}

		const currentWorkoutSets = await ctx.db
			.query("sets")
			.withIndex("workoutId", (q) => q.eq("workoutId", activeWorkout._id))
			.collect();

		// Group sets by exercise first
		const exerciseGroups: Record<
			string,
			{
				exercise: Doc<"exercises">;
				groupId: Doc<"exerciseGroups">;
				sets: Doc<"sets">[];
			}
		> = {};

		for (const set of currentWorkoutSets) {
			const exercise = await ctx.db.get(set.exerciseId);
			if (!exercise) continue;

			const groupId = exercise.groupId
				? await ctx.db.get(exercise.groupId)
				: null;

			if (!groupId) continue;

			const key = exercise._id;
			if (!exerciseGroups[key]) {
				exerciseGroups[key] = {
					exercise,
					groupId,
					sets: [],
				};
			}
			exerciseGroups[key].sets.push(set);
		}

		// Group by muscle group and format the response
		const result: Record<
			string,
			Array<{ exerciseName: string; sets: number; setsGoal: number }>
		> = {};

		for (const group of Object.values(exerciseGroups)) {
			const muscleGroupName = group.groupId.name;

			if (!result[muscleGroupName]) {
				result[muscleGroupName] = [];
			}

			result[muscleGroupName].push({
				exerciseName: group.exercise.name,
				sets: group.sets.length,
				setsGoal: group.exercise.setsGoal || 0,
			});
		}

		return result;
	},
});
