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

const defaultSetsCount = 4;

export function AppSidebar() {
	const currentWorkout = useQuery(api.workouts.getCurrentWorkout);

	return (
		<Sidebar>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Workout info</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenuSub className="gap-4">
							{currentWorkout &&
								currentWorkout.exercises.length > 0 &&
								currentWorkout.exercises.map((exercise) => {
									const isFinished = exercise.sets?.length === defaultSetsCount;

									return (
										<SidebarMenuSubItem
											key={exercise.id}
											className="flex justify-between"
										>
											{isFinished && (
												<CheckCircle className="size-4 text-green-600 absolute -left-8 top-1/2 -translate-y-1/2" />
											)}

											<div
												className={clsx(
													"flex flex-col",
													isFinished && "text-green-600",
												)}
											>
												<span>{exercise.name}</span>

												<span
													className={clsx(
														"text-xs",
														isFinished
															? "text-primary"
															: "text-muted-foreground",
													)}
												>
													{exercise.sets?.length} / {defaultSetsCount}
												</span>
											</div>
										</SidebarMenuSubItem>
									);
								})}
						</SidebarMenuSub>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
