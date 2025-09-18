import { useState } from "react";

import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";

import { Button } from "@/components/ui/button";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import { Diff } from "lucide-react";
import { BarbellSvg } from "./barbell-svg";

export function BarbellVisualizationDrawer({
	selectedUnit,
	onPlateSelect,
	onPlateRemove,
	weightValue,
	barbellWeight = 0,
}: {
	selectedUnit: "lbs" | "kg";
	weightValue: number;
	onPlateSelect: (plateValue: number) => void;
	onPlateRemove: (plateValue: number) => void;
	barbellWeight: number | undefined;
}) {
	const [selectedPlates, setSelectedPlates] = useState<number[]>([]);

	const plates = useQuery(api.plates.get, {
		unit: selectedUnit,
	});

	// const calculatePlates = () => {
	// 	if (barbell?.weight && barbell?.unit && weightValue && plates) {
	// 		const calculatedPlates: number[] = [];

	// 		// Convert barbell weight to selected unit
	// 		let barbellWeight: number;
	// 		if (selectedUnit === "lbs" && barbell?.unit === "lbs") {
	// 			barbellWeight = barbell.weight;
	// 		} else if (selectedUnit === "kg" && barbell?.unit === "kg") {
	// 			barbellWeight = barbell.weight;
	// 		} else if (selectedUnit === "lbs" && barbell?.unit === "kg") {
	// 			barbellWeight = kgToLbs(barbell.weight);
	// 		} else if (selectedUnit === "kg" && barbell?.unit === "lbs") {
	// 			barbellWeight = lbsToKg(barbell.weight);
	// 		} else {
	// 			barbellWeight = barbell.weight;
	// 		}

	// 		let remainingWeight = weightValue - barbellWeight;

	// 		// If remaining weight is negative or zero, no plates needed
	// 		if (remainingWeight <= 0) {
	// 			return [];
	// 		}

	// 		// Sort plates from heaviest to lightest for greedy algorithm
	// 		const sortedPlates = [...plates].sort((a, b) => b.weight - a.weight);

	// 		for (const plate of sortedPlates) {
	// 			while (remainingWeight >= plate.weight * 2) {
	// 				calculatedPlates.push(plate.weight);
	// 				remainingWeight -= plate.weight * 2;
	// 			}
	// 		}

	// 		return calculatedPlates;
	// 	}

	// 	return [];
	// };

	const handlePlateRemove = ({
		plate,
		index,
	}: { plate: number; index: number }) => {
		setSelectedPlates(selectedPlates.filter((_, i) => i !== index));
		onPlateRemove(plate);
	};

	const handlePlateSelect = (plate: number) => {
		setSelectedPlates([...selectedPlates, plate].sort((a, b) => b - a));
		onPlateSelect(plate);
	};

	return (
		<Drawer>
			<DrawerTrigger asChild>
				<Button variant="outline" size="icon">
					<Diff />
				</Button>
			</DrawerTrigger>

			<DrawerContent>
				<DrawerHeader className="m-auto relative">
					<DrawerTitle>
						{weightValue || 0} {selectedUnit}
					</DrawerTitle>
				</DrawerHeader>

				<div className="flex pr-2 items-start gap-6">
					<BarbellSvg
						unit={selectedUnit}
						selectedPlates={selectedPlates}
						onRemovePlate={handlePlateRemove}
						barbellWeight={barbellWeight}
					/>

					<div className="grid grid-cols-2 gap-2">
						{/* TODO: Loader */}
						{plates?.map((plate) => (
							<button
								type="button"
								key={plate._id}
								onClick={() => {
									handlePlateSelect(plate.weight);
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
