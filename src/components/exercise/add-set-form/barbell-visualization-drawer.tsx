import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";

import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import { useMemo } from "react";
import { BarbellSvg } from "./barbell-svg";

// Function to calculate which plates should be displayed on one side of the barbell
function calculatePlatesForWeight(
	weightValue: number,
	availablePlates: { weight: number }[],
	barbellWeight = 45, // Default Olympic barbell weight in lbs
) {
	// If no weight or weight is less than barbell weight, return empty array
	if (weightValue <= barbellWeight) {
		return [];
	}

	// Calculate the weight that needs to be distributed on both sides
	const weightPerSide = (weightValue - barbellWeight) / 2;

	// Sort plates by weight in descending order
	const sortedPlates = [...availablePlates].sort((a, b) => b.weight - a.weight);

	const selectedPlates: number[] = [];
	let remainingWeight = weightPerSide;

	// Greedy algorithm to select plates
	for (const plate of sortedPlates) {
		const plateWeight = plate.weight;
		// Calculate how many of this plate we can use
		const platesNeeded = Math.floor(remainingWeight / plateWeight);

		if (platesNeeded > 0) {
			// Add the plate to our selection (only one side, so we add it once)
			selectedPlates.push(plateWeight);
			remainingWeight -= plateWeight * platesNeeded;
		}

		// If we've used all the weight, break
		if (remainingWeight <= 0) {
			break;
		}
	}

	return selectedPlates;
}

export function BarbellVisualizationDrawer({
	open,
	onOpenChange,
	unit,
	weightValue,
	onPlateSelect,
	onPlateRemove,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	unit: "lbs" | "kg";
	weightValue: number;
	onPlateSelect: (plateValue: number) => void;
	onPlateRemove: (plateValue: number) => void;
}) {
	const plates = useQuery(api.plates.get, {
		unit,
	});

	// Calculate which plates should be displayed based on the weight value
	const selectedPlates = useMemo(() => {
		if (!plates || !weightValue) {
			return [];
		}

		// Get barbell weight based on unit (Olympic barbell: 45 lbs or 20 kg)
		const barbellWeight = unit === "lbs" ? 45 : 20;

		return calculatePlatesForWeight(weightValue, plates, barbellWeight);
	}, [plates, weightValue, unit]);

	const onRemovePlate = (index: number) => {
		onPlateRemove(selectedPlates[index]);
	};

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent>
				<DrawerHeader className="m-auto relative">
					<DrawerTitle>Barbell</DrawerTitle>
				</DrawerHeader>

				<div className="flex pr-2 items-start gap-6">
					<BarbellSvg
						unit={unit}
						selectedPlates={selectedPlates}
						onRemovePlate={onRemovePlate}
					/>

					<div className="grid grid-cols-2 gap-2">
						{/* TODO: Loader */}
						{plates?.map((plate) => (
							<button
								type="button"
								key={plate._id}
								onClick={() => {
									onPlateSelect(plate.weight);
								}}
								className="text-sm text-black bg-white rounded-md py-1 w-10"
							>
								{plate.weight}
							</button>
						))}
					</div>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
