import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";

export const Route = createFileRoute("/exercises_/$exerciseId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { exerciseId } = Route.useParams();

	const exercise = useQuery(api.exercises.getById, {
		exerciseId: exerciseId as Id<"exercises">,
	});

	return <div>{exercise?.name}</div>;
}
