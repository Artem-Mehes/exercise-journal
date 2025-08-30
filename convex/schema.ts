import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	exercises: defineTable({
		name: v.string(),
		sets: v.optional(
			v.array(
				v.object({
					count: v.number(),
					weight: v.number(),
				}),
			),
		),
	}),
	workouts: defineTable({
		name: v.string(),
		exercises: v.array(v.id("exercises")),
	}),
});
