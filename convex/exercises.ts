import { v } from "convex/values";
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

		// Fetch all sets for this exercise
		const sets = exercise.sets
			? await Promise.all(exercise.sets.map((setId) => ctx.db.get(setId)))
			: [];

		// Filter out any null sets (in case a set was deleted but reference wasn't cleaned up)
		const validSets = sets.filter((set) => set !== null);

		// Return last 10 sets, most recent first
		const lastSets = validSets.slice(-10).reverse();

		// Fetch muscle group info
		const muscleGroup = exercise.muscleGroupId
			? await ctx.db.get(exercise.muscleGroupId)
			: null;

		return {
			...exercise,
			muscleGroup,
			sets: lastSets,
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

export const create = mutation({
	args: {
		name: v.string(),
		muscleGroupId: v.optional(v.id("muscleGroups")),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("exercises", args);
	},
});

export const addSet = mutation({
	args: {
		exerciseId: v.id("exercises"),
		count: v.number(),
		weight: v.number(),
	},
	handler: async (ctx, args) => {
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

		// Add set ID to exercise's sets array
		const updatedSets = exercise.sets ? [...exercise.sets, setId] : [setId];

		await ctx.db.patch(args.exerciseId, {
			sets: updatedSets,
		});

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

		// Remove set ID from exercise's sets array
		const updatedSets = exercise.sets?.filter((id) => id !== args.setId) || [];

		await ctx.db.patch(set.exerciseId, {
			sets: updatedSets,
		});

		// Delete the set document
		await ctx.db.delete(args.setId);

		return set.exerciseId;
	},
});
