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
			<DrawerTrigger asChild>
				<Button variant="outline" size="sm" className="font-display">
					<ListChecks className="size-4" />
					Progress
				</Button>
			</DrawerTrigger>

			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle className="font-display tracking-tight">
						Progress
					</DrawerTitle>
				</DrawerHeader>

				<div className="min-h-60 space-y-6 px-4 pb-6">
					<div className="space-y-1 text-sm">
						{currentWorkoutExercises?.startedAt && (
							<div className="text-muted-foreground">
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
									className="space-y-2 not-last:border-b not-last:border-border/60 not-last:pb-3"
								>
									<div className="flex items-center gap-1.5">
										<h3 className="font-display font-bold tracking-tight">
											{groupName}
										</h3>
										<span className="text-muted-foreground text-sm">
											({exercises.length})
										</span>
									</div>

									<div className="space-y-1 pl-4 border-l-2 border-border/60">
										{exercises.map((exercise) => (
											<div
												key={exercise.id}
												className="flex items-center gap-4"
											>
												<span
													className={clsx(
														"text-sm",
														exercise.isFinished &&
															"line-through text-muted-foreground",
													)}
												>
													{exercise.name}
												</span>

												<div className="flex items-center gap-1">
													{exercise.setsCount ? (
														<span
															className={clsx(
																"flex font-display text-sm tabular-nums",
																exercise.isFinished
																	? "text-success"
																	: "text-muted-foreground",
															)}
														>
															{`${exercise.setsCount} sets`}
														</span>
													) : null}

													{exercise.isFinished && (
														<CheckCircle className="size-4 text-success" />
													)}
												</div>
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
