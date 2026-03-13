import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

export const getByDate = query({
	args: {
		date: v.string(),
	},
	handler: async (ctx, args) => {
		const planned = await ctx.db
			.query("plannedExercises")
			.withIndex("date", (q) => q.eq("date", args.date))
			.collect();

		const activeWorkout = await ctx.db
			.query("workouts")
			.filter((q) => q.eq(q.field("endTime"), undefined))
			.first();

		const finishedExerciseIds = new Set<string>();
		if (activeWorkout) {
			const finishedRows = await ctx.db
				.query("finishedExercises")
				.withIndex("workoutId", (q) =>
					q.eq("workoutId", activeWorkout._id),
				)
				.collect();
			for (const row of finishedRows) {
				finishedExerciseIds.add(row.exerciseId);
			}
		}

		const results = await Promise.all(
			planned.map(async (p) => {
				const exercise = await ctx.db.get(p.exerciseId);
				if (!exercise) return null;

				const group = await ctx.db.get(exercise.groupId);

				return {
					...p,
					exerciseName: exercise.name,
					groupName: group?.name ?? "",
					isFinished: finishedExerciseIds.has(p.exerciseId),
				};
			}),
		);

		return results.filter((r) => r !== null);
	},
});

export const getCountsByDates = query({
	args: {
		dates: v.array(v.string()),
	},
	handler: async (ctx, args) => {
		const counts: Record<string, number> = {};

		for (const date of args.dates) {
			const planned = await ctx.db
				.query("plannedExercises")
				.withIndex("date", (q) => q.eq("date", date))
				.collect();
			if (planned.length > 0) {
				counts[date] = planned.length;
			}
		}

		return counts;
	},
});

export const add = mutation({
	args: {
		exerciseId: v.id("exercises"),
		date: v.string(),
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query("plannedExercises")
			.withIndex("date_exerciseId", (q) =>
				q.eq("date", args.date).eq("exerciseId", args.exerciseId),
			)
			.first();

		if (existing) return existing._id;

		return await ctx.db.insert("plannedExercises", {
			exerciseId: args.exerciseId,
			date: args.date,
		});
	},
});

export const remove = mutation({
	args: {
		plannedExerciseId: v.id("plannedExercises"),
	},
	handler: async (ctx, args) => {
		await ctx.db.delete(args.plannedExerciseId);
	},
});


export const cleanupPastPlans = internalMutation({
	handler: async (ctx) => {
		const today = new Date().toISOString().slice(0, 10);

		const allPlanned = await ctx.db.query("plannedExercises").collect();

		for (const p of allPlanned) {
			if (p.date < today) {
				await ctx.db.delete(p._id);
			}
		}
	},
});
