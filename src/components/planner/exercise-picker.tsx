import { Input } from "@/components/ui/input";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Check, Search } from "lucide-react";
import { useState } from "react";

export function ExercisePicker({
	date,
	plannedExerciseIds,
}: {
	date: string;
	plannedExerciseIds: Set<string>;
}) {
	const [search, setSearch] = useState("");
	const groups = useQuery(api.exerciseGroups.getAllWithExercises);
	const addPlanned = useMutation(api.plannedExercises.add);

	if (!groups) return null;

	const allExercises = groups.flatMap((g) =>
		g.exercises.map((e) => ({
			id: e._id,
			name: e.name,
			groupName: g.name,
		})),
	);

	const filtered = search.trim()
		? allExercises.filter(
				(e) =>
					e.name.toLowerCase().includes(search.toLowerCase()) ||
					e.groupName.toLowerCase().includes(search.toLowerCase()),
			)
		: allExercises;

	return (
		<div className="flex flex-col gap-2 px-4 pb-4">
			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
				<Input
					autoFocus
					placeholder="Search exercises..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="pl-9"
				/>
			</div>

			<div className="max-h-64 overflow-y-auto space-y-1">
				{filtered.map((exercise) => {
					const isPlanned = plannedExerciseIds.has(exercise.id);

					return (
						<button
							key={exercise.id}
							type="button"
							disabled={isPlanned}
							onClick={() =>
								addPlanned({
									exerciseId: exercise.id as Id<"exercises">,
									date,
								})
							}
							className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
								isPlanned ? "opacity-50" : "hover:bg-accent active:bg-accent/80"
							}`}
						>
							<div className="flex-1 min-w-0">
								<div className="text-sm font-medium truncate">
									{exercise.name}
								</div>
								<div className="text-xs text-muted-foreground truncate">
									{exercise.groupName}
								</div>
							</div>
							{isPlanned && <Check className="size-4 text-primary shrink-0" />}
						</button>
					);
				})}
				{filtered.length === 0 && (
					<p className="text-sm text-muted-foreground text-center py-4">
						No exercises found
					</p>
				)}
			</div>
		</div>
	);
}
