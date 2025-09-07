import { useAppForm } from "@/hooks/form";
import { lbsToKg } from "@/lib/utils";
import { Route } from "@/routes/exercises_.$exerciseId";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function ExerciseAddSetForm() {
	const { exerciseId } = Route.useParams();

	const addSet = useMutation(api.exercises.addSet);

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
				weight: Math.round(weightInKg),
			});
		},
	});

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
						<form.AppField name="weight">
							{(field) => (
								<field.TextField
									label="Weight"
									type="number"
									onFocus={(e) => e.target.select()}
								/>
							)}
						</form.AppField>

						<form.AppField name="count">
							{(field) => (
								<field.TextField
									label="Count"
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
