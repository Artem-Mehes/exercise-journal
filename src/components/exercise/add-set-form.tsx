import { useAppForm } from "@/hooks/form";
import { lbsToKg } from "@/lib/utils";
import { Route } from "@/routes/exercises_.$exerciseId";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useEffect } from "react";
import z from "zod";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const validationSchema = z.object({
	count: z.string().min(1, {
		message: "Count is required",
	}),
	weight: z.string().min(1, {
		message: "Weight is required",
	}),
	unit: z.enum(["kg", "lbs"]),
});

export function ExerciseAddSetForm() {
	const { exerciseId } = Route.useParams();

	const addSet = useMutation(api.sets.add);

	const currentWorkoutSets = useQuery(
		api.exercises.getCurrentWorkoutSetsForExercise,
		{
			exerciseId: exerciseId as Id<"exercises">,
		},
	);

	const previousWorkoutSet = useQuery(
		api.exercises.getLastCompletedWorkoutSets,
		{
			exerciseId: exerciseId as Id<"exercises">,
		},
	);

	const form = useAppForm({
		defaultValues: {
			count: "",
			weight: "",
			unit: "kg",
		},
		validators: {
			onSubmit: validationSchema,
		},
		onSubmit: async ({ value }) => {
			const weightInKg =
				value.unit === "lbs"
					? lbsToKg(Number(value.weight))
					: Number(value.weight);

			await addSet({
				exerciseId: exerciseId as Id<"exercises">,
				count: Number(value.count),
				weight: Math.round(weightInKg),
			});
		},
	});

	useEffect(() => {
		if (previousWorkoutSet && currentWorkoutSets) {
			const previousWorkoutSetValues =
				previousWorkoutSet[currentWorkoutSets.length];

			if (previousWorkoutSetValues?.count && previousWorkoutSetValues?.weight) {
				form.setFieldValue("count", previousWorkoutSetValues.count.toString());
				form.setFieldValue(
					"weight",
					previousWorkoutSetValues.weight.toString(),
				);
			}
		}
	}, [currentWorkoutSets, previousWorkoutSet, form.setFieldValue]);

	return (
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
							{(field) => (
								<field.TextField
									inputMode="numeric"
									label="Reps"
									type="number"
									onFocus={(e) => e.target.select()}
								/>
							)}
						</form.AppField>

						<form.AppField name="weight">
							{(field) => (
								<field.TextField
									inputMode="numeric"
									label="Weight"
									type="number"
									onFocus={(e) => e.target.select()}
								/>
							)}
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
	);
}
