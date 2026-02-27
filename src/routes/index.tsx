import { ExercisesList } from "@/components/exercises-list";
import { CreateDrawer } from "@/components/exercises/create-drawer";
import { Input } from "@/components/ui/input";
import { WorkoutSummary } from "@/components/workout-summary";

import { createFileRoute } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useCallback, useState } from "react";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	const [searchQuery, setSearchQuery] = useState(
		() => localStorage.getItem("searchQuery") || "",
	);

	const updateSearchQuery = useCallback((value: string) => {
		setSearchQuery(value);
		if (value) {
			localStorage.setItem("searchQuery", value);
		} else {
			localStorage.removeItem("searchQuery");
		}
	}, []);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between gap-4">
				<h1 className="text-2xl font-bold tracking-tight">Exercises</h1>

				<CreateDrawer />
			</div>

			<div className="relative">
				<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60 pointer-events-none" />
				<Input
					placeholder="Search exercises or groups…"
					value={searchQuery}
					onChange={(e) => updateSearchQuery(e.target.value)}
					className="pl-9 pr-9 rounded-xl bg-card border-border/60 h-10"
				/>
				{searchQuery && (
					<button
						type="button"
						onClick={() => updateSearchQuery("")}
						className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground hover:text-foreground transition-colors"
					>
						<X className="size-3.5" />
					</button>
				)}
			</div>

			<WorkoutSummary />

			<ExercisesList searchQuery={searchQuery} />
		</div>
	);
}
