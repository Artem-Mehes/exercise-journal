import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const add = mutation({
	args: {
		exerciseId: v.id("exercises"),
		count: v.number(),
		weight: v.number(),
		unit: v.union(v.literal("kg"), v.literal("lbs")),
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
			unit: args.unit,
		});

		return setId;
	},
});

export const update = mutation({
	args: {
		setId: v.id("sets"),
		count: v.optional(v.number()),
		weight: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const updateParams: Partial<Doc<"sets">> = {};

		if (args.count) {
			updateParams.count = args.count;
		}

		if (args.weight) {
			updateParams.weight = args.weight;
		}

		await ctx.db.patch(args.setId, updateParams);

		return args.setId;
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
