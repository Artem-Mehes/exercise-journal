import { ExercisesList } from "@/components/exercises-list";
import { CreateDrawer } from "@/components/exercises/create-drawer";
import { Input } from "@/components/ui/input";

import { createFileRoute } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	const [searchQuery, setSearchQuery] = useState("");

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
					onChange={(e) => setSearchQuery(e.target.value)}
					className="pl-9 pr-9 rounded-xl bg-card border-border/60 h-10"
				/>
				{searchQuery && (
					<button
						type="button"
						onClick={() => setSearchQuery("")}
						className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground hover:text-foreground transition-colors"
					>
						<X className="size-3.5" />
					</button>
				)}
			</div>

			<ExercisesList searchQuery={searchQuery} />
		</div>
	);
}
