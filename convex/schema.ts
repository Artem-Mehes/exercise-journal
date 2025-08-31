import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	muscleGroups: defineTable({
		name: v.string(),
	}),
	exercises: defineTable({
		name: v.string(),
		muscleGroupId: v.optional(v.id("muscleGroups")),
		sets: v.optional(v.array(v.id("sets"))),
	}).index("muscleGroupId", ["muscleGroupId"]),
	sets: defineTable({
		exerciseId: v.id("exercises"),
		count: v.number(),
		weight: v.number(),
	}).index("exerciseId", ["exerciseId"]),
	workouts: defineTable({
		startTime: v.number(), // timestamp in milliseconds
	}).index("startTime", ["startTime"]),
});
