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
			exercises: [],
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

		// Check if workout has any exercises
		if (!activeWorkout.exercises || activeWorkout.exercises.length === 0) {
			// No exercises were performed, just delete the workout
			await ctx.db.delete(activeWorkout._id);
		} else {
			// Exercises were performed, save the workout with endTime
			await ctx.db.patch(activeWorkout._id, {
				endTime: Date.now(),
			});
		}

		return activeWorkout._id;
	},
});
