import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
	handler: async (ctx) => {
		return await ctx.db
			.query("cardio")
			.withIndex("createdAt")
			.order("desc")
			.collect();
	},
});

export const create = mutation({
	args: {
		title: v.string(),
		time: v.number(),
		incline: v.number(),
		speed: v.number(),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("cardio", {
			...args,
			createdAt: Date.now(),
		});
	},
});

export const update = mutation({
	args: {
		cardioId: v.id("cardio"),
		title: v.optional(v.string()),
		time: v.optional(v.number()),
		incline: v.optional(v.number()),
		speed: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const cardio = await ctx.db.get(args.cardioId);
		if (!cardio) {
			throw new Error("Cardio entry not found");
		}

		const { cardioId, ...updates } = args;
		await ctx.db.patch(cardioId, updates);
		return cardioId;
	},
});

export const toggleDone = mutation({
	args: {
		cardioId: v.id("cardio"),
	},
	handler: async (ctx, args) => {
		const cardio = await ctx.db.get(args.cardioId);
		if (!cardio) {
			throw new Error("Cardio entry not found");
		}

		const now = Date.now();
		const todayStart = new Date(now);
		todayStart.setHours(0, 0, 0, 0);

		const isDoneToday =
			cardio.doneAt !== undefined && cardio.doneAt >= todayStart.getTime();

		await ctx.db.patch(args.cardioId, {
			doneAt: isDoneToday ? undefined : now,
		});

		return args.cardioId;
	},
});

export const remove = mutation({
	args: {
		cardioId: v.id("cardio"),
	},
	handler: async (ctx, args) => {
		const cardio = await ctx.db.get(args.cardioId);
		if (!cardio) {
			throw new Error("Cardio entry not found");
		}
		await ctx.db.delete(args.cardioId);
		return args.cardioId;
	},
});
