import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppForm } from "@/hooks/form";
import { formatWeight, lbsToKg } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
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

	const addSet = useMutation(api.exercises.addSet);
	const deleteSet = useMutation(api.exercises.deleteSet);

	const form = useAppForm({
		defaultValues: {
			count: "",
			weight: "",
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

	const handleDeleteSet = async (setId: Id<"sets">) => {
		await deleteSet({
			setId,
		});
	};

	return (
		<>
			<h1 className="text-2xl font-bold">{exercise?.name}</h1>

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

			<Card className="py-4">
				<CardHeader className="px-4">
					<CardTitle>Last 10 sets</CardTitle>
				</CardHeader>
				<CardContent className="px-4">
					{exercise?.sets?.length === 0 ? (
						<p className="text-muted-foreground text-center py-4">
							No sets recorded yet
						</p>
					) : (
						<div className="space-y-2">
							{exercise?.sets?.map((set, index) => {
								const { kg, lbs } = formatWeight(set.weight);
								return (
									<div
										key={index}
										className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"
									>
										<div className="flex gap-4">
											<span className="font-medium">{set.count} reps</span>
											<span className="text-muted-foreground">×</span>
											<div className="flex flex-col">
												<span className="font-medium">{kg} kg</span>
												<span className="text-sm text-muted-foreground">
													{lbs} lbs
												</span>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<span className="text-sm text-muted-foreground">
												Set {exercise?.sets?.length - index}
											</span>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleDeleteSet(set._id)}
												className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card>
		</>
	);
}
