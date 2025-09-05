import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenuSub,
	SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import clsx from "clsx";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import { CheckCircle } from "lucide-react";

export function AppSidebar() {
	const currentWorkoutExercises = useQuery(
		api.workouts.getCurrentWorkoutExercises,
	);

	return (
		<Sidebar>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel className="text-lg p-0">
						Workout info
					</SidebarGroupLabel>
					<SidebarGroupContent className="pl-1">
						{currentWorkoutExercises?.startedAt && (
							<div className="text-xs text-muted-foreground mb-4">
								Started at{" "}
								{new Date(currentWorkoutExercises.startedAt).toLocaleString()}
							</div>
						)}

						{currentWorkoutExercises?.exercises.map(
							({ groupName, exercises }) => (
								<div
									key={groupName}
									className="space-y-2 not-last:border-b-1 not-last:border-accent-foreground/30 not-last:pb-3"
								>
									<h3 className="font-bold">{groupName}</h3>

									<SidebarMenuSub className="ml-2 mr-0">
										{exercises.map((exercise) => (
											<SidebarMenuSubItem
												key={exercise.name}
												className="text-xs flex items-center gap-2"
											>
												<span
													className={clsx(
														exercise.isFinished && "line-through",
													)}
												>
													{exercise.name}
												</span>

												<span
													className={clsx(
														"flex items-center gap-1",
														exercise.isFinished
															? "text-success"
															: "text-muted-foreground",
													)}
												>
													{`${exercise.setsCount}${exercise.setsGoal ? ` / ${exercise.setsGoal}` : ""}`}

													{exercise.isFinished && (
														<CheckCircle className="size-4" />
													)}
												</span>
											</SidebarMenuSubItem>
										))}
									</SidebarMenuSub>
								</div>
							),
						)}
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
