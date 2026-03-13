import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Check, Circle, Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import { ExercisePicker } from "./exercise-picker";

function formatDrawerDate(date: Date): string {
	return date.toLocaleDateString("en-US", {
		weekday: "long",
		month: "short",
		day: "numeric",
	});
}

export function DayPlanDrawer({
	date,
	dateStr,
	open,
	onOpenChange,
}: {
	date: Date;
	dateStr: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [showPicker, setShowPicker] = useState(false);
	const planned = useQuery(api.plannedExercises.getByDate, { date: dateStr });
	const currentWorkout = useQuery(api.workouts.getCurrentWorkout);
	const hasActiveWorkout = !!currentWorkout;
	const toggleFinished = useMutation(api.exercises.toggleFinished);
	const removePlanned = useMutation(api.plannedExercises.remove);

	const plannedExerciseIds = new Set(
		(planned ?? []).map((p) => p.exerciseId as string),
	);

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent>
				<DrawerHeader className="m-auto">
					<DrawerTitle>{formatDrawerDate(date)}</DrawerTitle>
				</DrawerHeader>

				<div className="px-4 pb-2 space-y-1">
					{planned && planned.length === 0 && !showPicker && (
						<p className="text-sm text-muted-foreground text-center py-4">
							No exercises planned
						</p>
					)}
					{planned?.map((item) => (
						<div
							key={item._id}
							className="flex items-center gap-3 rounded-lg px-3 py-2.5"
						>
							<button
								type="button"
								disabled={!hasActiveWorkout}
								onClick={() =>
									toggleFinished({
										exerciseId: item.exerciseId as Id<"exercises">,
									})
								}
								className="shrink-0"
							>
								{item.isFinished ? (
									<div className="flex size-6 items-center justify-center rounded-full bg-primary/20 border border-primary/30">
										<Check
											className="size-3.5 text-primary"
											strokeWidth={2.5}
										/>
									</div>
								) : hasActiveWorkout ? (
									<Circle className="size-6 text-muted-foreground/50" />
								) : (
									<Minus className="size-6 text-muted-foreground/25" />
								)}
							</button>

							<div
								className={`flex-1 min-w-0 ${item.isFinished ? "opacity-50" : ""}`}
							>
								<div
									className={`text-sm font-medium truncate ${item.isFinished ? "line-through" : ""}`}
								>
									{item.exerciseName}
								</div>
								<div className="text-xs text-muted-foreground truncate">
									{item.groupName}
								</div>
							</div>

							<button
								type="button"
								onClick={() =>
									removePlanned({
										plannedExerciseId: item._id as Id<"plannedExercises">,
									})
								}
								className="shrink-0 text-muted-foreground/50 hover:text-destructive transition-colors"
							>
								<X className="size-4" />
							</button>
						</div>
					))}
				</div>

				{showPicker ? (
					<ExercisePicker
						date={dateStr}
						plannedExerciseIds={plannedExerciseIds}
					/>
				) : (
					<div className="px-4 pb-4">
						<button
							type="button"
							onClick={() => setShowPicker(true)}
							className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
						>
							<Plus className="size-4" />
							Add exercise
						</button>
					</div>
				)}
			</DrawerContent>
		</Drawer>
	);
}
