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
		sets: v.optional(v.array(v.array(v.id("sets")))), // Array of arrays - each inner array is a workout session
		notes: v.optional(v.string()),
	}).index("muscleGroupId", ["muscleGroupId"]),
	sets: defineTable({
		exerciseId: v.id("exercises"),
		count: v.number(),
		weight: v.number(),
	}).index("exerciseId", ["exerciseId"]),
	workouts: defineTable({
		startTime: v.number(), // timestamp in milliseconds
		endTime: v.optional(v.number()), // timestamp when workout ended, null for active workout
		exercises: v.array(
			v.object({
				id: v.id("exercises"),
				sets: v.array(v.id("sets")),
				name: v.string(),
			}),
		), // Array of exercise IDs worked on in this session
	}).index("startTime", ["startTime"]),
	templates: defineTable({
		name: v.string(),
		exercises: v.optional(v.array(v.id("exercises"))),
	}),
});
