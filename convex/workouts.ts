import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const getAll = query({
	handler: async (ctx) => {
		const workouts = await ctx.db
			.query("workouts")
			.filter((q) => q.neq(q.field("endTime"), undefined))
			.order("desc")
			.collect();

		const workoutsWithExercises = await Promise.all(
			workouts.map(async (workout) => {
				const sets = await ctx.db
					.query("sets")
					.withIndex("workoutId", (q) => q.eq("workoutId", workout._id))
					.collect();

				const workoutGroups = new Set<string>();

				for (const set of sets) {
					const exercise = await ctx.db.get(set.exerciseId);

					if (!exercise) {
						continue;
					}

					const group = await ctx.db.get(exercise.groupId);

					if (!group) {
						continue;
					}

					workoutGroups.add(group.name);
				}

				return {
					...workout,
					groups: Array.from(workoutGroups),
				};
			}),
		);

		return workoutsWithExercises;
	},
});

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

		const sets = await ctx.db
			.query("sets")
			.withIndex("workoutId", (q) => q.eq("workoutId", activeWorkout._id))
			.collect();

		if (sets.length === 0) {
			const finishedRows = await ctx.db
				.query("finishedExercises")
				.withIndex("workoutId", (q) => q.eq("workoutId", activeWorkout._id))
				.collect();

			for (const row of finishedRows) {
				await ctx.db.delete(row._id);
			}

			await ctx.db.delete(activeWorkout._id);
		} else {
			await ctx.db.patch(activeWorkout._id, {
				endTime: Date.now(),
			});
		}

		return activeWorkout._id;
	},
});

export const getCurrentWorkoutExercises = query({
	handler: async (ctx) => {
		const activeWorkout = await ctx.db
			.query("workouts")
			.filter((q) => q.eq(q.field("endTime"), undefined))
			.first();

		if (!activeWorkout) {
			return null;
		}

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
					id: Id<"exercises">;
				}[];
			}[];
		} = {
			startedAt: activeWorkout?.startTime,
			totalExercises: 0,
			groups: [],
		};

		const currentWorkoutSets = await ctx.db
			.query("sets")
			.withIndex("workoutId", (q) => q.eq("workoutId", activeWorkout._id))
			.collect();

		const finishedRows = await ctx.db
			.query("finishedExercises")
			.withIndex("workoutId", (q) => q.eq("workoutId", activeWorkout._id))
			.collect();

		const finishedExerciseIds = new Set(
			finishedRows.map((r) => r.exerciseId),
		);

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
					exerciseInResult.isFinished = finishedExerciseIds.has(exercise._id);
				} else {
					result.totalExercises++;

					groupInResult.exercises.push({
						id: exercise._id,
						setsCount,
						name: exercise.name,
						isFinished: finishedExerciseIds.has(exercise._id),
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
							isFinished: finishedExerciseIds.has(exercise._id),
						},
					],
				});
			}
		}

		// Add finished exercises that have no sets in this workout
		const exerciseIdsWithSets = new Set(
			currentWorkoutSets.map((s) => s.exerciseId),
		);

		for (const row of finishedRows) {
			if (exerciseIdsWithSets.has(row.exerciseId)) {
				continue;
			}

			const exercise = await ctx.db.get(row.exerciseId);
			if (!exercise) {
				continue;
			}

			const groupId = exercise.groupId;
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
				result.totalExercises++;
				groupInResult.exercises.push({
					id: exercise._id,
					setsCount: 0,
					name: exercise.name,
					isFinished: true,
				});
			} else {
				result.totalExercises++;
				result.groups.push({
					id: groupId,
					groupName,
					exercises: [
						{
							id: exercise._id,
							setsCount: 0,
							name: exercise.name,
							isFinished: true,
						},
					],
				});
			}
		}

		return result;
	},
});

export const deleteWorkout = mutation({
	args: {
		workoutId: v.id("workouts"),
	},
	handler: async (ctx, args) => {
		await ctx.db.delete(args.workoutId);

		const sets = await ctx.db
			.query("sets")
			.withIndex("workoutId", (q) => q.eq("workoutId", args.workoutId))
			.collect();

		for (const set of sets) {
			await ctx.db.delete(set._id);
		}

		const finishedRows = await ctx.db
			.query("finishedExercises")
			.withIndex("workoutId", (q) => q.eq("workoutId", args.workoutId))
			.collect();

		for (const row of finishedRows) {
			await ctx.db.delete(row._id);
		}
	},
});

export const getSummary = query({
	args: {
		workoutId: v.id("workouts"),
	},
	handler: async (ctx, args) => {
		const workout = await ctx.db.get(args.workoutId);

		if (!workout) {
			return [];
		}

		const result: {
			id: Id<"exercises">;
			name: Doc<"exercises">["name"];
			setsCount: number;
			bestSet: Pick<Doc<"sets">, "count" | "weight" | "unit">;
			maxWeight: {
				value: number;
				unit: Doc<"sets">["unit"];
			};
		}[] = [];

		const sets = await ctx.db
			.query("sets")
			.withIndex("workoutId", (q) => q.eq("workoutId", args.workoutId))
			.collect();

		const exerciseMap = new Map<Id<"exercises">, typeof sets>();

		for (const set of sets) {
			const exerciseInMap = exerciseMap.get(set.exerciseId);

			if (exerciseInMap) {
				exerciseInMap.push(set);
			} else {
				exerciseMap.set(set.exerciseId, [set]);
			}
		}

		for (const [exerciseId, exerciseSets] of exerciseMap) {
			const exercise = await ctx.db.get(exerciseId);

			if (!exercise) {
				continue;
			}

			// Find the best set (highest weight, or if tied, highest reps)
			const records = exerciseSets.reduce(
				(best, current) => {
					if (current.weight > best.maxWeight.value) {
						best.maxWeight = {
							value: current.weight,
							unit: current.unit,
						};
					}

					const currentVolume = current.count * current.weight;
					const previousVolume = best.bestSet.count * best.bestSet.weight;

					if (currentVolume > previousVolume) {
						best.bestSet.count = current.count;
						best.bestSet.weight = current.weight;
						best.bestSet.unit = current.unit;
					}

					return best;
				},
				{
					bestSet: {
						count: 0,
						weight: 0,
						unit: "kg" as Doc<"sets">["unit"],
					},
					maxWeight: {
						value: 0,
						unit: "kg" as Doc<"sets">["unit"],
					},
				},
			);

			result.push({
				id: exerciseId,
				name: exercise.name,
				setsCount: exerciseSets.length,
				...records,
			});
		}

		return result;
	},
});
