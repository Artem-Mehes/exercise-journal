import { mutation } from "./_generated/server";

export const formatSetsWeights = mutation({
	handler: async (ctx) => {
		const sets = await ctx.db.query("sets").collect();

		for (const set of sets) {
			await ctx.db.patch(set._id, {
				weight: Math.floor(set.weight),
			});
		}
	},
});
