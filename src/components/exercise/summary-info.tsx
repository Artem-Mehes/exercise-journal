import { kgToLbs, lbsToKg } from "@/lib/utils";
import { Route } from "@/routes/exercises_.$exerciseId";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export function ExerciseSummaryInfo() {
	const { exerciseId } = Route.useParams();

	const summary = useQuery(api.exercises.getSummary, {
		exerciseId: exerciseId as Id<"exercises">,
	});

	if (summary === undefined) {
		return <Skeleton className="h-30" />;
	}

	if (summary?.bestSet === null) {
		return null;
	}

	const volumeBestSet = summary.bestSet.byVolume;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Records</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2">
					<div className="text-center">
						<div className="text-sm text-muted-foreground">Best Set</div>
						<div className="font-bold">
							{volumeBestSet.count} × {volumeBestSet.weight}{" "}
							{volumeBestSet.unit}
						</div>
						<div className="text-xs text-muted-foreground">
							(
							{Math.round(
								volumeBestSet.unit === "kg"
									? kgToLbs(volumeBestSet.weight)
									: lbsToKg(volumeBestSet.weight),
							)}{" "}
							{volumeBestSet.unit === "kg" ? "lbs" : "kg"})
						</div>
					</div>

					<div className="text-center">
						<div className="text-sm text-muted-foreground">Max Weight</div>
						<div className="font-bold text-success">
							{summary.maxWeight.value} {summary.maxWeight.unit}
						</div>
						<div className="text-xs text-muted-foreground">
							(
							{Math.round(
								summary.maxWeight.unit === "kg"
									? kgToLbs(summary.maxWeight.value)
									: lbsToKg(summary.maxWeight.value),
							)}{" "}
							{summary.maxWeight.unit === "kg" ? "lbs" : "kg"})
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
