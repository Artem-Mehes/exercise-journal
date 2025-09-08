import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { formatWeight } from "@/lib/utils";
import clsx from "clsx";
import type { Doc, Id } from "convex/_generated/dataModel";
import { Trash2 } from "lucide-react";

interface WorkoutSetsTableProps {
	sets: Doc<"sets">[];
	comparisonSets?: Doc<"sets">[];
	onDeleteSet?: (setId: Id<"sets">) => void;
	showDeleteButton?: boolean;
	emptyMessage?: string;
}

export function WorkoutSetsTable({
	sets,
	comparisonSets,
	onDeleteSet,
	showDeleteButton = false,
	emptyMessage = "No sets found",
}: WorkoutSetsTableProps) {
	if (!sets || sets.length === 0) {
		return (
			<p className="text-muted-foreground text-center py-4">{emptyMessage}</p>
		);
	}

	const currentTotalVolume = sets.reduce(
		(sum, set) => sum + set.count * set.weight,
		0,
	);
	const comparisonTotalVolume =
		comparisonSets?.reduce((sum, set) => sum + set.count * set.weight, 0) || 0;

	let totalVolumeColorClass = "";
	if (comparisonSets && comparisonSets.length > 0) {
		if (currentTotalVolume > comparisonTotalVolume) {
			totalVolumeColorClass = "text-success";
		} else if (currentTotalVolume < comparisonTotalVolume) {
			totalVolumeColorClass = "text-destructive";
		}
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Set</TableHead>
					<TableHead>Reps</TableHead>
					<TableHead>kg</TableHead>
					<TableHead>lbs</TableHead>
					<TableHead>Volume</TableHead>
					<TableHead />
				</TableRow>
			</TableHeader>
			<TableBody>
				{sets.map((set, index) => {
					const { kg, lbs } = formatWeight(set.weight);
					const volume = (set.count * set.weight).toFixed(0);

					let volumeColorClass = "";
					if (comparisonSets?.[index]) {
						const comparisonSetVolume =
							comparisonSets[index].count * comparisonSets[index].weight;
						const currentVolume = set.count * set.weight;
						if (currentVolume > comparisonSetVolume) {
							volumeColorClass = "text-success";
						} else if (currentVolume < comparisonSetVolume) {
							volumeColorClass = "text-destructive";
						}
					}

					return (
						<TableRow key={set._id}>
							<TableCell className="font-medium">{index + 1}</TableCell>
							<TableCell className={showDeleteButton ? "" : "font-bold"}>
								{set.count}
							</TableCell>
							<TableCell className={showDeleteButton ? "" : "font-bold"}>
								{kg}
							</TableCell>
							<TableCell className="text-muted-foreground">{lbs}</TableCell>
							<TableCell className={volumeColorClass}>{volume}</TableCell>
							<TableCell>
								{showDeleteButton && onDeleteSet && (
									<Button
										variant="ghost"
										size="sm"
										onClick={() => onDeleteSet(set._id)}
										className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								)}
							</TableCell>
						</TableRow>
					);
				})}
				{sets.length > 0 && (
					<TableRow>
						<TableCell className="font-bold">Total</TableCell>
						<TableCell className="font-bold">
							{sets.reduce((sum, set) => sum + set.count, 0)}
						</TableCell>
						<TableCell className="font-bold">
							{sets.reduce((sum, set) => sum + set.weight, 0)}
						</TableCell>
						<TableCell />
						<TableCell className={clsx("font-bold", totalVolumeColorClass)}>
							{currentTotalVolume}
						</TableCell>
						<TableCell />
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}
