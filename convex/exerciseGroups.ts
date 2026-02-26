import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const get = query({
	handler: async (ctx) => {
		return await ctx.db.query("exerciseGroups").collect();
	},
});

export const getById = query({
	args: {
		groupId: v.id("exerciseGroups"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.groupId);
	},
});

export const create = mutation({
	args: {
		name: v.string(),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("exerciseGroups", args);
	},
});

export const update = mutation({
	args: {
		groupId: v.id("exerciseGroups"),
		name: v.string(),
	},
	handler: async (ctx, args) => {
		const { groupId, ...updates } = args;
		return await ctx.db.patch(groupId, updates);
	},
});

export const remove = mutation({
	args: {
		groupId: v.id("exerciseGroups"),
	},
	handler: async (ctx, args) => {
		const muscleGroup = await ctx.db.get(args.groupId);
		if (!muscleGroup) {
			throw new Error("Muscle group not found");
		}

		const exercises = await ctx.db
			.query("exercises")
			.withIndex("groupId", (q) => q.eq("groupId", args.groupId))
			.collect();

		if (exercises.length > 0) {
			throw new Error(
				"Cannot delete muscle group that has associated exercises. Please delete the exercises first.",
			);
		}

		return await ctx.db.delete(args.groupId);
	},
});

export const getWithExercises = query({
	args: {
		groupId: v.id("exerciseGroups"),
	},
	handler: async (ctx, args) => {
		const muscleGroup = await ctx.db.get(args.groupId);
		if (!muscleGroup) {
			return null;
		}

		const exercises = await ctx.db
			.query("exercises")
			.withIndex("groupId", (q) => q.eq("groupId", args.groupId))
			.collect();

		return {
			...muscleGroup,
			exercises,
		};
	},
});

export const getAllWithExercises = query({
	handler: async (ctx) => {
		const exerciseGroups = await ctx.db.query("exerciseGroups").collect();

		const currentActiveWorkout = await ctx.db
			.query("workouts")
			.filter((q) => q.eq(q.field("endTime"), undefined))
			.first();

		const muscleGroupsWithExercises = await Promise.all(
			exerciseGroups.map(async (group) => {
				const exercises = await ctx.db
					.query("exercises")
					.withIndex("groupId", (q) => q.eq("groupId", group._id))
					.collect();

				let resultExercises: (Doc<"exercises"> & {
					isFinished?: boolean;
					currentSetsCount?: number;
				})[] = [];

				if (currentActiveWorkout) {
					resultExercises = await Promise.all(
						exercises.map(async (exercise) => {
							const sets = await ctx.db
								.query("sets")
								.withIndex("workoutId_exerciseId", (q) =>
									q
										.eq("workoutId", currentActiveWorkout._id)
										.eq("exerciseId", exercise._id),
								)
								.collect();

							return {
								...exercise,
								currentSetsCount: sets.length,
								isFinished: exercise.setsGoal
									? sets.length >= exercise.setsGoal
									: false,
							};
						}),
					);
				} else {
					resultExercises = exercises;
				}

				return {
					...group,
					exercises: resultExercises,
				};
			}),
		);

		return muscleGroupsWithExercises;
	},
});
