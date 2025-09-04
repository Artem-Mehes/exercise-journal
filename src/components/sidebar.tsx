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
						{currentWorkoutExercises?.map(({ groupName, exercises }) => (
							<div key={groupName}>
								<h3>{groupName}</h3>
								{exercises.map((exercise) => (
									<div key={exercise.name}>
										{exercise.name}

										{`${exercise.setsCount}${exercise.setsGoal ? `/${exercise.setsGoal}` : ""}`}
									</div>
								))}
							</div>
						))}
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
