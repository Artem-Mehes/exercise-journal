import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";

export function AppSidebar() {
	const currentWorkoutExercises = useQuery(
		api.workouts.getCurrentWorkoutExercises,
	);

	return (
		<Sidebar>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Workout info</SidebarGroupLabel>
					<SidebarGroupContent>
						{currentWorkoutExercises &&
							Object.entries(currentWorkoutExercises).map(
								([muscleGroupName, exercises]) => (
									<div key={muscleGroupName}>
										<h3>{muscleGroupName}</h3>
										{exercises.map((exercise) => (
											<div key={exercise.exerciseName}>
												{exercise.exerciseName}
												{exercise.sets} / {exercise.setsGoal}
											</div>
										))}
									</div>
								),
							)}
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
