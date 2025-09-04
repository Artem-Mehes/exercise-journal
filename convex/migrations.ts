import { mutation } from "./_generated/server";

export const removeMuscleGroupsFromExercises = mutation({
	handler: async (ctx) => {},
});

// export const migrateMuscleGroupsToExerciseGroups = mutation({
// 	handler: async (ctx) => {
// 		console.log("Starting migration from muscleGroups to exerciseGroups...");

// 		// Get all existing muscleGroups
// 		const muscleGroups = await ctx.db.query("muscleGroups").collect();
// 		console.log(`Found ${muscleGroups.length} muscle groups to migrate`);

// 		// Create mapping from old IDs to new IDs
// 		const idMapping = new Map();

// 		// Insert all muscleGroups data into exerciseGroups table
// 		for (const muscleGroup of muscleGroups) {
// 			const { _id, _creationTime, ...data } = muscleGroup;
// 			const newId = await ctx.db.insert("exerciseGroups", data);
// 			idMapping.set(_id, newId);
// 			console.log(`Migrated muscle group: ${data.name} (${_id} -> ${newId})`);
// 		}

// 		// Update all exercises to reference the new exerciseGroup IDs
// 		const exercises = await ctx.db.query("exercises").collect();
// 		console.log(`Found ${exercises.length} exercises to update`);

// 		for (const exercise of exercises) {
// 			const oldMuscleGroupId = exercise.muscleGroupId;
// 			const newExerciseGroupId = idMapping.get(oldMuscleGroupId);

// 			if (newExerciseGroupId) {
// 				await ctx.db.patch(exercise._id, {
// 					exerciseGroupId: newExerciseGroupId,
// 				});
// 				console.log(
// 					`Updated exercise: ${exercise.name} to use new exerciseGroupId`,
// 				);
// 			} else {
// 				console.warn(
// 					`Warning: Could not find new ID for muscleGroupId ${oldMuscleGroupId}`,
// 				);
// 			}
// 		}

// 		console.log("Migration completed successfully!");
// 		console.log("Next steps:");
// 		console.log(
// 			"1. Update your schema to use exerciseGroups instead of muscleGroups",
// 		);
// 		console.log("2. Update all function files to use the new table name");
// 		console.log("3. Deploy the schema changes");
// 		console.log("4. Run the cleanup migration to remove old muscleGroups data");

// 		return {
// 			migratedGroups: muscleGroups.length,
// 			updatedExercises: exercises.length,
// 			idMapping: Object.fromEntries(idMapping),
// 		};
// 	},
// });

// export const cleanupOldMuscleGroups = mutation({
// 	handler: async (ctx) => {
// 		console.log("Starting cleanup of old muscleGroups data...");

// 		// Remove muscleGroupId field from exercises (if it still exists)
// 		const exercises = await ctx.db.query("exercises").collect();
// 		for (const exercise of exercises) {
// 			if (exercise.muscleGroupId) {
// 				await ctx.db.patch(exercise._id, {
// 					muscleGroupId: undefined,
// 				});
// 				console.log(`Removed muscleGroupId from exercise: ${exercise.name}`);
// 			}
// 		}

// 		// Delete all old muscleGroups
// 		const muscleGroups = await ctx.db.query("muscleGroups").collect();
// 		for (const muscleGroup of muscleGroups) {
// 			await ctx.db.delete(muscleGroup._id);
// 			console.log(`Deleted old muscle group: ${muscleGroup.name}`);
// 		}

// 		console.log(
// 			`Cleanup completed! Removed ${muscleGroups.length} old muscle groups`,
// 		);
// 		return { deletedGroups: muscleGroups.length };
// 	},
// });
