import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { kgToLbs } from "@/lib/utils";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";

export function WorkoutSummaryTable({
	workoutId,
}: { workoutId: Id<"workouts"> }) {
	const workoutSummary = useQuery(api.workouts.getSummary, {
		workoutId,
	});

	return (
		<Table className="text-xs">
			<TableHeader>
				<TableRow>
					<TableHead>Exercise</TableHead>
					<TableHead>Sets</TableHead>
					<TableHead>Best Set</TableHead>
					<TableHead>Max Weight</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{workoutSummary?.map((data) => (
					<TableRow key={data.id}>
						<TableCell className="font-medium max-w-[100px] truncate">
							{data.name}
						</TableCell>
						<TableCell>{data.setsCount}</TableCell>
						<TableCell>
							{data.bestSet.count} x {data.bestSet.weight} kg{" "}
						</TableCell>
						<TableCell>
							{data.maxWeight} kg{" "}
							<span className="text-muted-foreground">
								({Math.round(kgToLbs(data.maxWeight))} lbs)
							</span>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
			<TableFooter>
				<TableRow>
					<TableCell className="font-bold">Total</TableCell>
					<TableCell className="font-bold">
						{workoutSummary?.reduce((sum, data) => sum + data.setsCount, 0)}
					</TableCell>
					<TableCell className="font-bold">
						{workoutSummary?.reduce(
							(sum, data) => sum + data.bestSet.count * data.bestSet.weight,
							0,
						)}
					</TableCell>
				</TableRow>
			</TableFooter>
		</Table>
	);
}
