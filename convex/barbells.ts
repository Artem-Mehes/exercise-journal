import { query } from "./_generated/server";

export const get = query({
	handler: async (ctx) => {
		const barbells = await ctx.db.query("barbells").collect();
		return barbells;
	},
});
