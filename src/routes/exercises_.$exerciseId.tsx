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
import { useAppForm } from "@/hooks/form";
import { formatWeight, lbsToKg } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import clsx from "clsx";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/exercises_/$exerciseId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { exerciseId } = Route.useParams();

	const exercise = useQuery(api.exercises.getById, {
		exerciseId: exerciseId as Id<"exercises">,
	});

	const currentWorkout = useQuery(api.workouts.getCurrentWorkout);
	const currentWorkoutSets = useQuery(api.exercises.getCurrentWorkoutSets, {
		exerciseId: exerciseId as Id<"exercises">,
	});
	const lastWorkoutSets = useQuery(api.exercises.getLastCompletedWorkoutSets, {
		exerciseId: exerciseId as Id<"exercises">,
	});
	const addSet = useMutation(api.exercises.addSet);
	const deleteSet = useMutation(api.exercises.deleteSet);

	const handleDeleteSet = async (setId: Id<"sets">) => {
		try {
			await deleteSet({ setId });
		} catch (error) {
			console.error("Failed to delete set:", error);
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
			<h1 className="text-2xl font-bold">{exercise?.name}</h1>

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
				<Card className=" border-green-800 bg-green-950/50">
					<CardHeader>
						<CardTitle className="text-green-300">Current Session</CardTitle>
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

			<Card className="bg-accent border-accent-foreground/60">
				<CardHeader>
					<CardTitle>Last Session</CardTitle>
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
		</>
	);
}
