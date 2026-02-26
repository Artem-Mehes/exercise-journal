import { ExercisesList } from "@/components/exercises-list";
import { CreateDrawer } from "@/components/exercises/create-drawer";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between gap-4">
				<h1 className="text-2xl font-bold tracking-tight">Exercises</h1>

				<CreateDrawer />
			</div>

			<ExercisesList />
		</div>
	);
}
