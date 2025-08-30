import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	exercises: defineTable({
		name: v.string(),
		sets: v.optional(v.array(v.id("sets"))),
	}),
	sets: defineTable({
		exerciseId: v.id("exercises"),
		count: v.number(),
		weight: v.number(),
	}).index("exerciseId", ["exerciseId"]),
});
