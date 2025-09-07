import { kgToLbs } from "@/lib/utils";
import { Route } from "@/routes/exercises_.$exerciseId";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Skeleton } from "../ui/skeleton";

export function ExerciseSummaryInfo() {
	const { exerciseId } = Route.useParams();

	const summary = useQuery(api.exercises.getSummary, {
		exerciseId: exerciseId as Id<"exercises">,
	});

	if (summary === undefined) {
		return <Skeleton className="h-6" />;
	}

	if (summary?.bestSet === null) {
		return null;
	}

	return (
		<div className="text-sm">
			<div>
				Best Set : {summary?.bestSet.count} x {summary?.bestSet.weight} kg{" "}
				<span className="text-muted-foreground">
					({Math.round(kgToLbs(summary?.bestSet.weight ?? 0))} lbs)
				</span>
			</div>
		</div>
	);
}
