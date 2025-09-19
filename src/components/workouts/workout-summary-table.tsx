import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Skeleton } from "../ui/skeleton";

export function WorkoutSummaryTable({
	workoutId,
}: { workoutId: Id<"workouts"> }) {
	const workoutSummary = useQuery(api.workouts.getSummary, {
		workoutId,
	});

	if (workoutSummary === undefined) {
		return <Skeleton className="h-50 bg-foreground/10" />;
	}

	return (
		<Table>
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
							{data.bestSet.count} x {data.bestSet.weight} {data.bestSet.unit}
						</TableCell>
						<TableCell>
							{data.maxWeight.value} {data.maxWeight.unit}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
			<TableFooter>
				<TableRow>
					<TableCell className="font-bold">
						Total: {workoutSummary?.length}
					</TableCell>
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
