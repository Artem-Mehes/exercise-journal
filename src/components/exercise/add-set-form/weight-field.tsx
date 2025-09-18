import { kgToLbs, lbsToKg } from "@/lib/utils";
import { Route } from "@/routes/exercises_.$exerciseId";
import type { AnyFieldApi } from "@tanstack/react-form";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { BarbellVisualizationDrawer } from "./barbell-visualization-drawer";

export function WeightField({
	field,
	unit,
}: { field: AnyFieldApi; unit: "kg" | "lbs" }) {
	const { exerciseId } = Route.useParams();

	const exercise = useQuery(api.exercises.getById, {
		exerciseId: exerciseId as Id<"exercises">,
	});

	const barbell = exercise?.barbell;
	const barbellWeight = barbell && {
		kg:
			barbell?.unit === "kg"
				? barbell?.weight
				: Math.ceil(lbsToKg(barbell?.weight)),
		lbs:
			barbell?.unit === "lbs"
				? barbell?.weight
				: Math.ceil(kgToLbs(barbell?.weight)),
	};

	const isOlympicBarbell = barbell?.name === "Olympic";

	return (
		<>
			{/* @ts-ignore */}
			<field.TextField
				inputMode="decimal"
				label="Weight"
				type="number"
				onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.select()}
			/>

			{isOlympicBarbell && (
				<BarbellVisualizationDrawer
					selectedUnit={unit}
					weightValue={field.state.value}
					barbellWeight={barbellWeight?.[unit]}
					onPlateSelect={(plateValue) => {
						const currentValue = +field.state.value;
						const barbellWeightValue = barbellWeight?.[unit] || 0;

						field.handleChange(
							String(
								currentValue
									? currentValue + plateValue * 2
									: currentValue + plateValue * 2 + barbellWeightValue,
							),
						);
					}}
					onPlateRemove={(plateValue) =>
						field.handleChange(+field.state.value - plateValue * 2)
					}
				/>
			)}
		</>
	);
}
