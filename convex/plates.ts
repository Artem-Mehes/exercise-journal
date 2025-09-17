import { v } from "convex/values";
import { query } from "./_generated/server";

export const get = query({
	args: {
		unit: v.union(v.literal("kg"), v.literal("lbs")),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("plates")
			.filter((q) => q.eq(q.field("unit"), args.unit))
			.collect();
	},
});
