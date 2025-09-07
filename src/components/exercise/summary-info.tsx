import { Route } from "@/routes/exercises_.$exerciseId";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";

export function ExerciseSummaryInfo() {
	const { exerciseId } = Route.useParams();

	const summary = useQuery(api.exercises.getSummary, {
		exerciseId: exerciseId as Id<"exercises">,
	});

	return (
		<div>
			<div>
				<h3>Best Set</h3>
				<p>
					{summary?.bestSet.count} x {summary?.bestSet.weight}
				</p>
			</div>
		</div>
	);
}
