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
import clsx from "clsx";
import type { Doc, Id } from "convex/_generated/dataModel";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
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

	const useComparison = Boolean(comparisonSets && comparisonSets.length > 0);

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

					const comparisonWeight = comparisonSet?.weight ?? 0;
					const comparisonCount = comparisonSet?.count ?? 0;

					const weightIncreased = set.weight > comparisonWeight;
					const weightDecreased = set.weight < comparisonWeight;
					const countIncreased = set.count > comparisonCount;
					const countDecreased = set.count < comparisonCount;

					return (
						<TableRow key={set._id}>
							<TableCell>{index + 1}</TableCell>
							<EditableSetRowCell
								setId={set._id}
								countValue={set.count}
								field="count"
								className={clsx(
									useComparison && {
										"border-success text-success": countIncreased,
										"border-destructive text-destructive": countDecreased,
									},
								)}
							>
								{useComparison && countIncreased ? (
									<ChevronUp className="size-4" />
								) : countDecreased ? (
									<ChevronDown className="size-4" />
								) : null}
							</EditableSetRowCell>
							<TableCell>
								<div
									className={clsx(
										"font-bold flex items-center",
										useComparison && {
											"text-success": weightIncreased,
											"text-destructive": weightDecreased,
										},
									)}
								>
									<span>
										{set.weight} {set.unit}
									</span>
									{useComparison && weightIncreased ? (
										<ChevronUp className="size-4" />
									) : weightDecreased ? (
										<ChevronDown className="size-4" />
									) : null}
								</div>

								<span className="text-muted-foreground">
									(
									{Math.round(
										set.unit === "kg"
											? kgToLbs(set.weight)
											: lbsToKg(set.weight),
									)}{" "}
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
