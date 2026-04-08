import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

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

export const cleanupPastPlans = internalMutation({
	handler: async (ctx) => {
		const today = new Date().toISOString().slice(0, 10);

		const allPlanned = await ctx.db.query("plannedCardio").collect();
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

		// Check which dates had cardio done
		const cardioEntries = await ctx.db
			.query("cardio")
			.filter((q) => q.neq(q.field("doneAt"), undefined))
			.collect();

		const datesWithCardio = new Set<string>();
		for (const c of cardioEntries) {
			if (c.doneAt !== undefined) {
				const cardioDate = new Date(c.doneAt).toISOString().slice(0, 10);
				datesWithCardio.add(cardioDate);
			}
		}

		for (const [date, plans] of plansByDate) {
			if (datesWithCardio.has(date)) {
				// Cardio was done on this day — delete the plans
				for (const p of plans) {
					await ctx.db.delete(p._id);
				}
			} else {
				// No cardio on this day — move plans to today
				for (const p of plans) {
					const alreadyPlanned = await ctx.db
						.query("plannedCardio")
						.withIndex("date_cardioId", (q) =>
							q.eq("date", today).eq("cardioId", p.cardioId),
						)
						.first();

					if (alreadyPlanned) {
						await ctx.db.delete(p._id);
					} else {
						await ctx.db.patch(p._id, { date: today });
					}
				}
			}
		}
	},
});
