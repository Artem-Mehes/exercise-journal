import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const startWorkout = mutation({
	handler: async (ctx) => {
		// Check if there's already an active workout (since we only allow one)
		const activeWorkout = await ctx.db.query("workouts").first();

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

		// Delete the workout instead of setting endTime
		await ctx.db.delete(args.workoutId);

		return args.workoutId;
	},
});

export const getCurrentWorkout = query({
	handler: async (ctx) => {
		// Since we only allow one workout at a time, just get the first (and only) one
		const activeWorkout = await ctx.db.query("workouts").first();

		return activeWorkout;
	},
});

export const endCurrentWorkout = mutation({
	handler: async (ctx) => {
		// Find the active workout (since we only allow one, just get the first)
		const activeWorkout = await ctx.db.query("workouts").first();

		if (!activeWorkout) {
			throw new Error("No active workout found");
		}

		// Delete the workout
		await ctx.db.delete(activeWorkout._id);

		return activeWorkout._id;
	},
});
