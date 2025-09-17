import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	exerciseGroups: defineTable({
		name: v.string(),
	}),
	exercises: defineTable({
		name: v.string(),
		groupId: v.id("exerciseGroups"),
		notes: v.optional(v.string()),
		setsGoal: v.optional(v.number()),
		barbellId: v.optional(v.id("barbells")),
	}).index("groupId", ["groupId"]),
	sets: defineTable({
		exerciseId: v.id("exercises"),
		workoutId: v.id("workouts"),
		count: v.number(),
		weight: v.number(),
		unit: v.union(v.literal("kg"), v.literal("lbs")),
	})
		.index("exerciseId", ["exerciseId"])
		.index("workoutId", ["workoutId"])
		.index("workoutId_exerciseId", ["workoutId", "exerciseId"]),
	workouts: defineTable({
		startTime: v.number(),
		endTime: v.optional(v.number()),
	}).index("startTime", ["startTime"]),
	templates: defineTable({
		name: v.optional(v.string()),
		exercises: v.array(v.id("exercises")),
	}),
	barbells: defineTable({
		name: v.string(),
		weight: v.number(),
		unit: v.union(v.literal("kg"), v.literal("lbs")),
	}),
	plates: defineTable({
		weight: v.number(),
		unit: v.union(v.literal("kg"), v.literal("lbs")),
	}),
});
