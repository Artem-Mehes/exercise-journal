import { useAppForm } from "@/hooks/form";
import { Route } from "@/routes/exercises_.$exerciseId";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { PlusCircle } from "lucide-react";
import { useEffect } from "react";
import z from "zod";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { WeightField } from "./weight-field";

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
		<Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5 shadow-sm">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<CardHeader className="flex justify-between items-center pb-2">
					<div className="flex items-center gap-2">
						<div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
							<PlusCircle className="size-4 text-primary" />
						</div>
						<CardTitle className="text-base font-semibold">Add Set</CardTitle>
					</div>

					<form.AppField name="unit">
						{(field) => <field.RadioGroupField options={["kg", "lbs"]} />}
					</form.AppField>
				</CardHeader>

				<CardContent>
					<div className="flex gap-3 items-end">
						<div className="flex-1">
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
						</div>

						<div className="flex-1">
							<form.Subscribe selector={(state) => state.values.unit}>
								{(unit) => (
									<form.AppField name="weight">
										{(field) => <WeightField field={field} unit={unit} />}
									</form.AppField>
								)}
							</form.Subscribe>
						</div>

						<Button type="submit" size="icon" className="shrink-0">
							<PlusCircle className="size-5" />
						</Button>
					</div>
				</CardContent>
			</form>
		</Card>
	);
}
