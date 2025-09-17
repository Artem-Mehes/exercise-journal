// import { Route } from "@/routes/exercises_.$exerciseId";
import type { AnyFieldApi } from "@tanstack/react-form";
// import { api } from "convex/_generated/api";
// import type { Id } from "convex/_generated/dataModel";
// import { useQuery } from "convex/react";
import { useState } from "react";
import { BarbellVisualizationDrawer } from "./barbell-visualization-drawer";

export function WeightField({
	field,
	unit,
}: { field: AnyFieldApi; unit: "kg" | "lbs" }) {
	// const { exerciseId } = Route.useParams();

	// const exercise = useQuery(api.exercises.getById, {
	// 	exerciseId: exerciseId as Id<"exercises">,
	// });

	const [drawerOpen, setDrawerOpen] = useState(false);

	// const barbell = exercise?.barbell;

	// const isOlympicBarbell = barbell?.name === "Olympic";

	return (
		<>
			{/* @ts-ignore */}
			<field.TextField
				inputMode="decimal"
				label="Weight"
				type="number"
				onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.select()}
				// onClick={(e: React.MouseEvent<HTMLInputElement>) => {
				// 	if (isOlympicBarbell) {
				// 		e.preventDefault();
				// 		setDrawerOpen(true);
				// 	}
				// }}
			/>

			<BarbellVisualizationDrawer
				open={drawerOpen}
				onOpenChange={setDrawerOpen}
				unit={unit}
				weightValue={+field.state.value}
				onPlateSelect={(plateValue) =>
					field.handleChange(+field.state.value + plateValue)
				}
				onPlateRemove={(plateValue) =>
					field.handleChange(+field.state.value - plateValue)
				}
			/>
		</>
	);
}
