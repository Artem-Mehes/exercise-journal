import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByDate = query({
	args: {
		date: v.string(),
	},
	handler: async (ctx, args) => {
		const planned = await ctx.db
			.query("plannedCardio")
			.withIndex("date", (q) => q.eq("date", args.date))
			.collect();

		const results = await Promise.all(
			planned.map(async (p) => {
				const cardio = await ctx.db.get(p.cardioId);
				if (!cardio) return null;

				return {
					...p,
					title: cardio.title,
					time: cardio.time,
					incline: cardio.incline,
					speed: cardio.speed,
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
				.query("plannedCardio")
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
		cardioId: v.id("cardio"),
		date: v.string(),
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query("plannedCardio")
			.withIndex("date_cardioId", (q) =>
				q.eq("date", args.date).eq("cardioId", args.cardioId),
			)
			.first();

		if (existing) return existing._id;

		return await ctx.db.insert("plannedCardio", {
			cardioId: args.cardioId,
			date: args.date,
		});
	},
});

export const remove = mutation({
	args: {
		plannedCardioId: v.id("plannedCardio"),
	},
	handler: async (ctx, args) => {
		await ctx.db.delete(args.plannedCardioId);
	},
});