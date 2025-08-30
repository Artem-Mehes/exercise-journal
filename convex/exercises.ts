import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
	handler: async (ctx) => {
		return await ctx.db.query("exercises").collect();
	},
});

export const getById = query({
	args: {
		exerciseId: v.id("exercises"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.exerciseId);
	},
});

export const create = mutation({
	args: {
		name: v.string(),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("exercises", args);
	},
});
