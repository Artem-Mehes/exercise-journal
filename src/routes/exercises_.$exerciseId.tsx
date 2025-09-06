import { ExerciseBreadcrumbs } from "@/components/exercise/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAppForm } from "@/hooks/form";
import { formatWeight, lbsToKg } from "@/lib/utils";
import { Link, createFileRoute } from "@tanstack/react-router";
import clsx from "clsx";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
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
	const addSet = useMutation(api.exercises.addSet);
	const deleteSet = useMutation(api.exercises.deleteSet);
	const updateNotes = useMutation(api.exercises.updateNotes);

	const [isNotesOpened, setIsNotesOpened] = useState(false);
	const [notesValue, setNotesValue] = useState(exercise?.notes || "");

	useEffect(() => {
		if (exercise?.notes) {
			setNotesValue(exercise.notes);
		}
	}, [exercise?.notes]);

	const handleDeleteSet = async (setId: Id<"sets">) => {
		try {
			await deleteSet({ setId });
		} catch (error) {
			console.error("Failed to delete set:", error);
		}
	};

	const handleSaveNotes = async () => {
		try {
			await updateNotes({
				exerciseId: exerciseId as Id<"exercises">,
				notes: notesValue,
			});
		} catch (error) {
			console.error("Failed to save notes:", error);
		}
	};

	// Determine if we should prepopulate with last workout's first set
	const shouldPrepopulate =
		currentWorkout &&
		(!currentWorkoutSets || currentWorkoutSets.length === 0) &&
		lastWorkoutSets &&
		lastWorkoutSets.length > 0;

	const form = useAppForm({
		defaultValues: {
			count: shouldPrepopulate ? lastWorkoutSets[0].count.toString() : "",
			weight: shouldPrepopulate ? lastWorkoutSets[0].weight.toString() : "",
			unit: "kg",
		},
		onSubmit: async ({ value }) => {
			const weightInKg =
				value.unit === "lbs"
					? lbsToKg(Number(value.weight))
					: Number(value.weight);

			await addSet({
				exerciseId: exerciseId as Id<"exercises">,
				count: Number(value.count),
				weight: weightInKg,
			});
		},
	});

	return (
		<>
			<div className="flex justify-between items-center">
				<ExerciseBreadcrumbs />

				<Button
					variant="outline"
					size="sm"
					onClick={() => setIsNotesOpened(!isNotesOpened)}
				>
					<Pencil className="w-4 h-4" />
					Notes
				</Button>
			</div>

			{isNotesOpened && (
				<Card className="bg-yellow-500/10 border-yellow-500/40">
					<CardContent>
						<div className="space-y-3">
							<Textarea
								value={notesValue}
								onChange={(e) => setNotesValue(e.target.value)}
								className="min-h-24 border-none bg-transparent focus-visible:ring-0 resize-none"
								autoFocus
							/>
							<Button size="sm" onClick={handleSaveNotes}>
								Save
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{currentWorkout && (
				<Card>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
						className="space-y-4"
					>
						<CardHeader className="flex justify-between items-center">
							<CardTitle>Add Set</CardTitle>

							<form.AppField name="unit">
								{(field) => <field.RadioGroupField options={["kg", "lbs"]} />}
							</form.AppField>
						</CardHeader>

						<CardContent className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<form.AppField name="count">
									{(field) => <field.TextField label="Count" type="number" />}
								</form.AppField>

								<form.AppField name="weight">
									{(field) => <field.TextField label="Weight" type="number" />}
								</form.AppField>
							</div>

							<div className="md:col-span-3">
								<Button type="submit" className="w-full">
									Add Set
								</Button>
							</div>
						</CardContent>
					</form>
				</Card>
			)}

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
												volumeColorClass = "text-green-600";
											} else if (currentVolume < lastSetVolume) {
												volumeColorClass = "text-red-600";
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
													totalVolumeColorClass = "text-green-600";
												} else if (currentTotalVolume < lastTotalVolume) {
													totalVolumeColorClass = "text-red-600";
												}
											}

											return (
												<TableRow className="border-t-2">
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
														className={clsx("font-bold", totalVolumeColorClass)}
													>
														{currentTotalVolume.toFixed(0)}
													</TableCell>
													<TableCell />
												</TableRow>
											);
										})()}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>
			)}

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
											<TableCell className="font-medium">{index + 1}</TableCell>
											<TableCell>{set.count}</TableCell>
											<TableCell>{kg}</TableCell>
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

			{/* Related Exercises */}
			{exercise?.muscleGroup &&
				relatedExercises &&
				relatedExercises.length > 1 && (
					<Card>
						<CardHeader>
							<CardTitle>Other {exercise.muscleGroup.name} Exercises</CardTitle>
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
											className="p-2 rounded-lg border text-center text-sm bg-sidebar-accent/40"
										>
											{relatedExercise.name}
										</Link>
									))}
							</div>
						</CardContent>
					</Card>
				)}
		</>
	);
}
