import { v } from 'convex/values';
import { mutation, query } from './_generated/server'

export const get = query({
  args: {},
  handler: async (ctx) => {
		return await ctx.db.query("exercises").collect();
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