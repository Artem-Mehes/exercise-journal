import { ExerciseAddSetForm } from "@/components/exercise/add-set-form";
import { ExerciseBreadcrumbs } from "@/components/exercise/breadcrumbs";
import { EditExerciseDrawer } from "@/components/exercise/edit-exercise-drawer";
import { NotesDrawer } from "@/components/exercise/notes-drawer";
import { ExerciseSummaryInfo } from "@/components/exercise/summary-info";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { formatWeight } from "@/lib/utils";
import { Link, createFileRoute } from "@tanstack/react-router";
import clsx from "clsx";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { CheckCircle, Trash2 } from "lucide-react";

export const Route = createFileRoute("/exercises_/$exerciseId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { exerciseId } = Route.useParams();

	const exercise = useQuery(api.exercises.getById, {
		exerciseId: exerciseId as Id<"exercises">,
	});

	const currentWorkout = useQuery(api.workouts.getCurrentWorkout);
	const currentWorkoutSets = useQuery(
		api.exercises.getCurrentWorkoutSetsForExercise,
		{
			exerciseId: exerciseId as Id<"exercises">,
		},
	);
	const lastWorkoutSets = useQuery(api.exercises.getLastCompletedWorkoutSets, {
		exerciseId: exerciseId as Id<"exercises">,
	});

	const relatedExercises = useQuery(
		api.exercises.getByMuscleGroup,
		exercise?.groupId ? { groupId: exercise.groupId } : "skip",
	);

	const deleteSet = useMutation(api.exercises.deleteSet);

	const handleDeleteSet = async (setId: Id<"sets">) => {
		try {
			await deleteSet({ setId });
		} catch (error) {
			console.error("Failed to delete set:", error);
		}
	};

	if (exercise === undefined) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-10" />
				<Skeleton className="h-30" />
				<Skeleton className="h-30" />
				<Skeleton className="h-30" />
			</div>
		);
	}

	return (
		<>
			<div className="flex justify-between">
				<div className="flex items-center gap-3">
					<ExerciseBreadcrumbs />

					<EditExerciseDrawer exerciseId={exerciseId as Id<"exercises">} />
				</div>

				<NotesDrawer />
			</div>

			{currentWorkout && <ExerciseAddSetForm />}

			{currentWorkout && (
				<Card>
					<CardHeader>
						<CardTitle className="text-primary">Current Session</CardTitle>
					</CardHeader>
					<CardContent>
						{!currentWorkoutSets || currentWorkoutSets.length === 0 ? (
							<p className="text-muted-foreground text-center py-4">
								No sets in current session
							</p>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-16">Set</TableHead>
										<TableHead className="w-20">Reps</TableHead>
										<TableHead className="w-24">kg</TableHead>
										<TableHead className="w-24">lbs</TableHead>
										<TableHead className="w-20">Volume</TableHead>
										<TableHead className="w-16" />
									</TableRow>
								</TableHeader>
								<TableBody>
									{currentWorkoutSets.map((set, index) => {
										const { kg, lbs } = formatWeight(set.weight);
										const volume = (set.count * set.weight).toFixed(0);

										let volumeColorClass = "";
										if (lastWorkoutSets?.[index]) {
											const lastSetVolume =
												lastWorkoutSets[index].count *
												lastWorkoutSets[index].weight;
											const currentVolume = set.count * set.weight;
											if (currentVolume > lastSetVolume) {
												volumeColorClass = "text-success";
											} else if (currentVolume < lastSetVolume) {
												volumeColorClass = "text-destructive";
											}
										}

										return (
											<TableRow key={set._id}>
												<TableCell className="font-medium">
													{index + 1}
												</TableCell>
												<TableCell>{set.count}</TableCell>
												<TableCell>{kg}</TableCell>
												<TableCell className="text-muted-foreground">
													{lbs}
												</TableCell>
												<TableCell className={volumeColorClass}>
													{volume}
												</TableCell>
												<TableCell>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleDeleteSet(set._id)}
														className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</TableCell>
											</TableRow>
										);
									})}
									{currentWorkoutSets.length > 0 &&
										(() => {
											// Calculate total volumes for comparison
											const currentTotalVolume = currentWorkoutSets.reduce(
												(sum, set) => sum + set.count * set.weight,
												0,
											);
											const lastTotalVolume =
												lastWorkoutSets?.reduce(
													(sum, set) => sum + set.count * set.weight,
													0,
												) || 0;

											// Determine color class for total volume
											let totalVolumeColorClass = "";
											if (lastWorkoutSets && lastWorkoutSets.length > 0) {
												if (currentTotalVolume > lastTotalVolume) {
													totalVolumeColorClass = "text-success";
												} else if (currentTotalVolume < lastTotalVolume) {
													totalVolumeColorClass = "text-destructive";
												}
											}

											return (
												<TableFooter>
													<TableRow>
														<TableCell className="font-bold">Total</TableCell>
														<TableCell className="font-bold">
															{currentWorkoutSets.reduce(
																(sum, set) => sum + set.count,
																0,
															)}
														</TableCell>
														<TableCell className="font-bold">
															{currentWorkoutSets
																.reduce((sum, set) => sum + set.weight, 0)
																.toFixed(1)}
														</TableCell>
														<TableCell />
														<TableCell
															className={clsx(
																"font-bold",
																totalVolumeColorClass,
															)}
														>
															{currentTotalVolume.toFixed(0)}
														</TableCell>
														<TableCell />
													</TableRow>
												</TableFooter>
											);
										})()}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>
			)}

			<ExerciseSummaryInfo />

			<Card>
				<CardHeader>
					<CardTitle>Last Workout Sets</CardTitle>
				</CardHeader>
				<CardContent>
					{!lastWorkoutSets || lastWorkoutSets.length === 0 ? (
						<p className="text-muted-foreground text-center py-4">
							No sets from last session
						</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-16">Set</TableHead>
									<TableHead className="w-20">Reps</TableHead>
									<TableHead className="w-24">kg</TableHead>
									<TableHead className="w-24">lbs</TableHead>
									<TableHead className="w-20">Volume</TableHead>
									<TableHead className="w-16" />
								</TableRow>
							</TableHeader>
							<TableBody>
								{lastWorkoutSets.map((set, index) => {
									const { kg, lbs } = formatWeight(set.weight);
									const volume = (set.count * set.weight).toFixed(0);
									return (
										<TableRow key={set._id}>
											<TableCell className="font-muted-foreground">
												{index + 1}
											</TableCell>
											<TableCell className="font-bold">{set.count}</TableCell>
											<TableCell className="font-bold">{kg}</TableCell>
											<TableCell className="text-muted-foreground">
												{lbs}
											</TableCell>
											<TableCell>{volume}</TableCell>
											<TableCell>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleDeleteSet(set._id)}
													className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</TableCell>
										</TableRow>
									);
								})}
								{lastWorkoutSets.length > 0 && (
									<TableRow className="border-t-2">
										<TableCell className="font-bold">Total</TableCell>
										<TableCell className="font-bold">
											{lastWorkoutSets.reduce((sum, set) => sum + set.count, 0)}
										</TableCell>
										<TableCell className="font-bold">
											{lastWorkoutSets
												.reduce((sum, set) => sum + set.weight, 0)
												.toFixed(1)}
										</TableCell>
										<TableCell />
										<TableCell className="font-bold">
											{lastWorkoutSets
												.reduce((sum, set) => sum + set.count * set.weight, 0)
												.toFixed(0)}
										</TableCell>
										<TableCell />
									</TableRow>
								)}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{exercise && relatedExercises && relatedExercises.length > 1 && (
				<Card>
					<CardHeader>
						<CardTitle>Related</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
							{relatedExercises
								.filter(
									(relatedExercise) => relatedExercise._id !== exercise._id,
								)
								.map((relatedExercise) => (
									<Link
										key={relatedExercise._id}
										to="/exercises/$exerciseId"
										params={{ exerciseId: relatedExercise._id }}
										className={clsx(
											"p-2 rounded-lg border text-center text-sm relative",
											relatedExercise.isFinished
												? "line-through border-success"
												: "bg-sidebar-accent/40",
										)}
									>
										{relatedExercise.name}

										{relatedExercise.isFinished && (
											<CheckCircle className="size-4 text-success absolute top-1 right-1" />
										)}
									</Link>
								))}
						</div>
					</CardContent>
				</Card>
			)}
		</>
	);
}
