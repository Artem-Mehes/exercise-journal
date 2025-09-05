import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const startWorkout = mutation({
	handler: async (ctx) => {
		// Check if there's already an active workout (one without endTime)
		const activeWorkout = await ctx.db
			.query("workouts")
			.filter((q) => q.eq(q.field("endTime"), undefined))
			.first();

		if (activeWorkout) {
			throw new Error("A workout is already in progress");
		}

		// Create new workout
		const workoutId = await ctx.db.insert("workouts", {
			startTime: Date.now(),
		});

		return workoutId;
	},
});

export const endWorkout = mutation({
	args: {
		workoutId: v.id("workouts"),
	},
	handler: async (ctx, args) => {
		const workout = await ctx.db.get(args.workoutId);
		if (!workout) {
			throw new Error("Workout not found");
		}

		if (workout.endTime) {
			throw new Error("Workout is already ended");
		}

		// Set endTime instead of deleting
		await ctx.db.patch(args.workoutId, {
			endTime: Date.now(),
		});

		return args.workoutId;
	},
});

export const getCurrentWorkout = query({
	handler: async (ctx) => {
		// Find the active workout (one without endTime)
		const activeWorkout = await ctx.db
			.query("workouts")
			.filter((q) => q.eq(q.field("endTime"), undefined))
			.first();

		if (!activeWorkout) {
			return null;
		}

		return activeWorkout;
	},
});

export const endCurrentWorkout = mutation({
	handler: async (ctx) => {
		// Find the active workout (one without endTime)
		const activeWorkout = await ctx.db
			.query("workouts")
			.filter((q) => q.eq(q.field("endTime"), undefined))
			.first();

		if (!activeWorkout) {
			throw new Error("No active workout found");
		}

		await ctx.db.patch(activeWorkout._id, {
			endTime: Date.now(),
		});

		return activeWorkout._id;
	},
});

export const getCurrentWorkoutExercises = query({
	handler: async (ctx) => {
		const activeWorkout = await ctx.db
			.query("workouts")
			.filter((q) => q.eq(q.field("endTime"), undefined))
			.first();

		const result: {
			startedAt: number | undefined;
			totalExercises: number;
			groups: {
				id: Id<"exerciseGroups">;
				groupName: string;
				exercises: {
					setsCount: number;
					name: string;
					isFinished: boolean;
					setsGoal: number | undefined;
					id: Id<"exercises">;
				}[];
			}[];
		} = {
			startedAt: activeWorkout?.startTime,
			totalExercises: 0,
			groups: [],
		};

		if (!activeWorkout) {
			return result;
		}

		const currentWorkoutSets = await ctx.db
			.query("sets")
			.withIndex("workoutId", (q) => q.eq("workoutId", activeWorkout._id))
			.collect();

		for (const set of currentWorkoutSets) {
			const exercise = await ctx.db.get(set.exerciseId);

			if (!exercise) {
				continue;
			}

			const groupId = exercise?.groupId;

			if (!groupId) {
				continue;
			}

			const group = await ctx.db.get(groupId);

			if (!group) {
				continue;
			}

			const groupName = group.name;

			const groupInResult = result.groups.find(
				(r) => r.groupName === groupName,
			);

			if (groupInResult) {
				const setsCount = currentWorkoutSets.filter(
					(s) => s.exerciseId === exercise._id,
				).length;

				const exerciseInResult = groupInResult.exercises.find(
					(e) => e.id === exercise._id,
				);

				if (exerciseInResult) {
					exerciseInResult.setsCount = setsCount;
					exerciseInResult.isFinished = exercise.setsGoal
						? setsCount >= exercise.setsGoal
						: false;
				} else {
					result.totalExercises++;

					groupInResult.exercises.push({
						id: exercise._id,
						setsCount,
						name: exercise.name,
						isFinished: exercise.setsGoal
							? setsCount >= exercise.setsGoal
							: false,
						setsGoal: exercise.setsGoal,
					});
				}
			} else {
				result.totalExercises++;

				result.groups.push({
					id: groupId,
					groupName,
					exercises: [
						{
							id: exercise._id,
							setsCount: 1,
							name: exercise.name,
							isFinished: false,
							setsGoal: exercise.setsGoal,
						},
					],
				});
			}
		}

		return result;
	},
});
