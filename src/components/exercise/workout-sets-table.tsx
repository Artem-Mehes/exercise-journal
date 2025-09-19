import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { kgToLbs, lbsToKg } from "@/lib/utils";
import type { Doc, Id } from "convex/_generated/dataModel";
import { Trash2 } from "lucide-react";
import { EditableSetRowCell } from "./editable-set-row-cell";

interface WorkoutSetsTableProps {
	sets: Doc<"sets">[];
	comparisonSets?: Doc<"sets">[];
	onDeleteSet: (setId: Id<"sets">) => void;
	emptyMessage?: string;
}

export function WorkoutSetsTable({
	sets,
	comparisonSets,
	onDeleteSet,
	emptyMessage = "No sets found",
}: WorkoutSetsTableProps) {
	if (!sets || sets.length === 0) {
		return (
			<p className="text-muted-foreground text-center py-4">{emptyMessage}</p>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Set</TableHead>
					<TableHead>Reps</TableHead>
					<TableHead className="w-32">Weight</TableHead>
					<TableHead className="w-10" />
				</TableRow>
			</TableHeader>
			<TableBody>
				{sets.map((set, index) => {
					const comparisonSet = comparisonSets?.[index];

					const comparisonWeight = comparisonSet?.weight;
					const comparisonUnit = comparisonSet?.unit;
					const comparisonCount = comparisonSet?.count;

					return (
						<TableRow key={set._id}>
							<TableCell>{index + 1}</TableCell>
							<EditableSetRowCell setId={set._id} field="count">
								{set.count}
							</EditableSetRowCell>
							<TableCell className="space-x-1">
								<span className="font-bold">
									{set.weight} {set.unit}
								</span>
								<span className="text-muted-foreground">
									(
									{Math.round(
										set.unit === "kg"
											? kgToLbs(set.weight)
											: lbsToKg(set.weight),
									)}
									{set.unit === "kg" ? "lbs" : "kg"})
								</span>
							</TableCell>
							<TableCell>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => onDeleteSet(set._id)}
									className="h-8 w-8 p-0 text-destructive"
								>
									<Trash2 className="h-4 w-4" />
								</Button>
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
						<TableCell />
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}
