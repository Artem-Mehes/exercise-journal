import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	muscleGroups: defineTable({
		name: v.string(),
		exercises: v.optional(v.array(v.id("exercises"))),
	}),
	exercises: defineTable({
		name: v.string(),
		muscleGroupId: v.id("muscleGroups"),
		notes: v.optional(v.string()),
		setsGoal: v.optional(v.number()),
	}).index("muscleGroupId", ["muscleGroupId"]),
	sets: defineTable({
		exerciseId: v.id("exercises"),
		workoutId: v.id("workouts"), // Made required
		count: v.number(),
		weight: v.number(),
	})
		.index("exerciseId", ["exerciseId"])
		.index("workoutId", ["workoutId"])
		.index("workoutId_exerciseId", ["workoutId", "exerciseId"]),
	workouts: defineTable({
		startTime: v.number(),
		endTime: v.optional(v.number()),
	}).index("startTime", ["startTime"]),
	templates: defineTable({
		name: v.string(),
		exercises: v.optional(v.array(v.id("exercises"))),
	}),
});
