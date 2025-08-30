import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
	handler: async (ctx) => {
		return await ctx.db.query("muscleGroups").collect();
	},
});

export const getById = query({
	args: {
		muscleGroupId: v.id("muscleGroups"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.muscleGroupId);
	},
});

export const create = mutation({
	args: {
		name: v.string(),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("muscleGroups", args);
	},
});

export const update = mutation({
	args: {
		muscleGroupId: v.id("muscleGroups"),
		name: v.string(),
	},
	handler: async (ctx, args) => {
		const { muscleGroupId, ...updates } = args;
		return await ctx.db.patch(muscleGroupId, updates);
	},
});

export const remove = mutation({
	args: {
		muscleGroupId: v.id("muscleGroups"),
	},
	handler: async (ctx, args) => {
		// Check if any exercises are using this muscle group
		const exercises = await ctx.db
			.query("exercises")
			.withIndex("muscleGroupId", (q) =>
				q.eq("muscleGroupId", args.muscleGroupId),
			)
			.collect();

		if (exercises.length > 0) {
			throw new Error(
				"Cannot delete muscle group that has associated exercises",
			);
		}

		return await ctx.db.delete(args.muscleGroupId);
	},
});

export const getWithExercises = query({
	args: {
		muscleGroupId: v.id("muscleGroups"),
	},
	handler: async (ctx, args) => {
		const muscleGroup = await ctx.db.get(args.muscleGroupId);
		if (!muscleGroup) {
			return null;
		}

		const exercises = await ctx.db
			.query("exercises")
			.withIndex("muscleGroupId", (q) =>
				q.eq("muscleGroupId", args.muscleGroupId),
			)
			.collect();

		return {
			...muscleGroup,
			exercises,
		};
	},
});
