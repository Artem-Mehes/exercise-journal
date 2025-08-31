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
		return await ctx.db.insert("muscleGroups", {
			...args,
			exercises: [],
		});
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
		const muscleGroup = await ctx.db.get(args.muscleGroupId);
		if (!muscleGroup) {
			throw new Error("Muscle group not found");
		}

		// Check if any exercises are associated with this muscle group
		const exerciseIds = muscleGroup.exercises || [];
		if (exerciseIds.length > 0) {
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

export const getAllWithExercises = query({
	handler: async (ctx) => {
		const muscleGroups = await ctx.db.query("muscleGroups").collect();

		// Fetch exercise details for each muscle group
		const muscleGroupsWithExercises = await Promise.all(
			muscleGroups.map(async (muscleGroup) => {
				const exerciseIds = muscleGroup.exercises || [];
				const exercises = await Promise.all(
					exerciseIds.map(async (exerciseId) => {
						return await ctx.db.get(exerciseId);
					}),
				);

				// Filter out any null exercises (in case of deleted exercises)
				const validExercises = exercises.filter(
					(exercise) => exercise !== null,
				);

				return {
					...muscleGroup,
					exercises: validExercises,
				};
			}),
		);

		return muscleGroupsWithExercises;
	},
});
