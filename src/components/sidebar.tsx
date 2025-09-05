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
						{currentWorkoutExercises ? "Workout info" : "Workout not started"}
					</SidebarGroupLabel>
					<SidebarGroupContent className="pl-1 space-y-4">
						{currentWorkoutExercises && (
							<>
								<div className="space-y-1">
									{currentWorkoutExercises?.startedAt && (
										<div className="text-xs text-muted-foreground ">
											Started at{" "}
											{new Date(
												currentWorkoutExercises.startedAt,
											).toLocaleString()}
										</div>
									)}

									<div className="text-xs text-muted-foreground">
										Total exercises: {currentWorkoutExercises?.totalExercises}
									</div>
								</div>

								<div className="space-y-3">
									{currentWorkoutExercises?.groups.map(
										({ groupName, id, exercises }) => (
											<div
												key={id}
												className="space-y-2 not-last:border-b-1 not-last:border-accent-foreground/30 not-last:pb-3"
											>
												<div className="flex items-center gap-1">
													<h3 className="font-bold">{groupName}</h3>{" "}
													<span className="text-xs text-muted-foreground">
														({exercises.length})
													</span>
												</div>

												<SidebarMenuSub className="ml-2 mr-0">
													{exercises.map((exercise) => (
														<SidebarMenuSubItem
															key={exercise.id}
															className="text-xs flex items-center gap-2"
														>
															<span
																className={clsx(
																	"max-w-30 truncate",
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
																{`${exercise.setsCount}${exercise.setsGoal ? ` / ${exercise.setsGoal}` : " sets"}`}

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
								</div>
							</>
						)}
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
