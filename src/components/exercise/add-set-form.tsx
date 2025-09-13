import { useAppForm } from "@/hooks/form";
import { Route } from "@/routes/exercises_.$exerciseId";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { SquareCheckBig } from "lucide-react";
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

const defaultValues: z.infer<typeof validationSchema> = {
	count: "",
	weight: "",
	unit: "kg",
};

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
		defaultValues,
		validators: {
			onSubmit: validationSchema,
		},
		onSubmit: async ({ value }) => {
			await addSet({
				exerciseId: exerciseId as Id<"exercises">,
				count: Number(value.count),
				weight: Number(value.weight),
				unit: value.unit,
			});
		},
	});

	useEffect(() => {
		if (previousWorkoutSet && currentWorkoutSets) {
			const previousWorkoutSetValues =
				previousWorkoutSet[currentWorkoutSets.length];

			if (
				previousWorkoutSetValues?.count &&
				previousWorkoutSetValues?.weight &&
				!form.state.values.count &&
				!form.state.values.weight
			) {
				form.setFieldValue("count", previousWorkoutSetValues.count.toString());
				form.setFieldValue(
					"weight",
					previousWorkoutSetValues.weight.toString(),
				);
				form.setFieldValue("unit", previousWorkoutSetValues.unit);
			}
		}
	}, [
		currentWorkoutSets,
		previousWorkoutSet,
		form.setFieldValue,
		form.state.values.count,
		form.state.values.weight,
	]);

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
					<div className="flex space-x-4 items-end">
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
									inputMode="decimal"
									label="Weight"
									type="number"
									onFocus={(e) => e.target.select()}
								/>
							)}
						</form.AppField>

						<Button type="submit" size="icon">
							<SquareCheckBig />
						</Button>
					</div>
				</CardContent>
			</form>
		</Card>
	);
}
