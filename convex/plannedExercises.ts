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
		const pastPlanned = allPlanned.filter((p) => p.date < today);

		if (pastPlanned.length === 0) return;

		// Group past plans by date
		const plansByDate = new Map<string, typeof pastPlanned>();
		for (const p of pastPlanned) {
			const existing = plansByDate.get(p.date);
			if (existing) {
				existing.push(p);
			} else {
				plansByDate.set(p.date, [p]);
			}
		}

		// Get all completed workouts to check which dates had workouts
		const completedWorkouts = await ctx.db
			.query("workouts")
			.filter((q) => q.neq(q.field("endTime"), undefined))
			.collect();

		// Build a set of dates that had completed workouts
		const datesWithWorkouts = new Set<string>();
		for (const w of completedWorkouts) {
			const workoutDate = new Date(w.startTime).toISOString().slice(0, 10);
			datesWithWorkouts.add(workoutDate);
		}

		for (const [date, plans] of plansByDate) {
			if (datesWithWorkouts.has(date)) {
				// Workout was done on this day — delete the plans
				for (const p of plans) {
					await ctx.db.delete(p._id);
				}
			} else {
				// No workout on this day — move plans to today
				for (const p of plans) {
					// Check if this exercise is already planned for today
					const alreadyPlanned = await ctx.db
						.query("plannedExercises")
						.withIndex("date_exerciseId", (q) =>
							q.eq("date", today).eq("exerciseId", p.exerciseId),
						)
						.first();

					if (alreadyPlanned) {
						// Already planned for today, just delete the old one
						await ctx.db.delete(p._id);
					} else {
						// Move to today by updating the date
						await ctx.db.patch(p._id, { date: today });
					}
				}
			}
		}
	},
});
