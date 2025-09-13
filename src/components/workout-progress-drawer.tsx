import { Button } from "./ui/button";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "./ui/drawer";

import clsx from "clsx";
import { useQuery } from "convex/react";
import { CheckCircle, ListChecks } from "lucide-react";
import { api } from "../../convex/_generated/api";

export function WorkoutProgressDrawer() {
	const currentWorkoutExercises = useQuery(
		api.workouts.getCurrentWorkoutExercises,
	);

	return (
		<Drawer>
			<DrawerTrigger>
				<Button variant="outline">
					<ListChecks />
					Progress
				</Button>
			</DrawerTrigger>

			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Progress</DrawerTitle>
				</DrawerHeader>

				<div className="min-h-60 space-y-6 px-4 pb-6">
					<div className="space-y-1">
						{currentWorkoutExercises?.startedAt && (
							<div className="text-muted-foreground ">
								Started at{" "}
								{new Date(currentWorkoutExercises.startedAt).toLocaleString()}
							</div>
						)}

						<div className="text-muted-foreground">
							Total exercises: {currentWorkoutExercises?.totalExercises}
						</div>
					</div>

					<div className="space-y-4">
						{currentWorkoutExercises?.groups.map(
							({ groupName, id, exercises }) => (
								<div
									key={id}
									className="space-y-2 not-last:border-b-1 not-last:border-accent-foreground/30 not-last:pb-3"
								>
									<div className="flex items-center gap-1">
										<h3 className="font-bold">{groupName}</h3>{" "}
										<span className="text-muted-foreground">
											({exercises.length})
										</span>
									</div>

									<div className="space-y-1 pl-4 border-l-2">
										{exercises.map((exercise) => (
											<div
												key={exercise.id}
												className="flex items-center gap-4"
											>
												<span
													className={clsx(
														"text-sm",
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
														<CheckCircle className="size-4 text-success" />
													)}
												</span>
											</div>
										))}
									</div>
								</div>
							),
						)}
					</div>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
