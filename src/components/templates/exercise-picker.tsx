import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Dumbbell } from "lucide-react";

interface ExercisePickerProps {
	selectedExerciseIds: Id<"exercises">[];
	onToggleExercise: (exerciseId: Id<"exercises">, name: string) => void;
}

export function ExercisePicker({
	selectedExerciseIds,
	onToggleExercise,
}: ExercisePickerProps) {
	const muscleGroups = useQuery(api.exerciseGroups.getAllWithExercises);

	if (muscleGroups === undefined) {
		return (
			<div className="space-y-2">
				{[...Array(3)].map((_, i) => (
					<Skeleton key={i} className="h-12 w-full rounded-lg" />
				))}
			</div>
		);
	}

	return (
		<Accordion type="multiple" className="w-full space-y-2">
			{muscleGroups.map((group) => (
				<AccordionItem
					key={group._id}
					value={group._id}
					className="rounded-lg border bg-card px-3"
				>
					<AccordionTrigger className="py-3 hover:no-underline">
						<div className="flex items-center gap-2">
							<div className="flex size-6 items-center justify-center rounded bg-primary/10 text-primary">
								<Dumbbell className="size-3" />
							</div>
							<span className="text-sm font-semibold">{group.name}</span>
						</div>
					</AccordionTrigger>
					<AccordionContent className="pb-3">
						<div className="space-y-1">
							{group.exercises.map((exercise) => {
								const isSelected = selectedExerciseIds.includes(exercise._id);
								return (
									<button
										type="button"
										key={exercise._id}
										className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-accent"
										onClick={() =>
											onToggleExercise(exercise._id, exercise.name)
										}
									>
										<Checkbox checked={isSelected} />
										<span className="text-sm font-medium">{exercise.name}</span>
									</button>
								);
							})}
							{group.exercises.length === 0 && (
								<p className="text-xs text-muted-foreground p-2">
									No exercises in this group.
								</p>
							)}
						</div>
					</AccordionContent>
				</AccordionItem>
			))}
		</Accordion>
	);
}
