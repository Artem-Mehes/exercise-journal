import { Skeleton } from "@/components/ui/skeleton";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";

export const Route = createFileRoute("/exercises")({
	component: RouteComponent,
});

function RouteComponent() {
	const exercises = useQuery(api.exercises.get);

	if (exercises === undefined) {
		return (
			<div className="space-y-2">
				<Skeleton className="h-4" />
				<Skeleton className="h-4" />
				<Skeleton className="h-4" />
				<Skeleton className="h-4" />
				<Skeleton className="h-4" />
			</div>
		);
	}

	return (
		<>
			<h1 className="text-2xl font-bold">Exercises</h1>

			<ul>
				{exercises?.map((exercise) => (
					<li key={exercise._id}>{exercise.name}</li>
				))}
			</ul>
		</>
	);
}
