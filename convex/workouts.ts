import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
	handler: async (ctx) => {
		return await ctx.db.query("workouts").collect();
	},
});

export const getWithExercises = query({
	handler: async (ctx) => {
		const workouts = await ctx.db.query("workouts").collect();

		// Populate exercises for each workout
		const workoutsWithExercises = await Promise.all(
			workouts.map(async (workout) => {
				const exercises = await Promise.all(
					workout.exercises.map(async (exerciseId) => {
						return await ctx.db.get(exerciseId);
					}),
				);

				return {
					...workout,
					exerciseDetails: exercises.filter(Boolean), // Filter out any null results
				};
			}),
		);

		return workoutsWithExercises;
	},
});

export const create = mutation({
	args: {
		name: v.string(),
		exercises: v.array(v.id("exercises")),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("workouts", args);
	},
});
