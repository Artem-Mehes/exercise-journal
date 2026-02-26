import { ExerciseAddSetForm } from "@/components/exercise/add-set-form";
import { ExerciseBreadcrumbs } from "@/components/exercise/breadcrumbs";
import { EditExerciseDrawer } from "@/components/exercise/edit-exercise-drawer";
import { NotesDrawer } from "@/components/exercise/notes-drawer";
import { ExerciseSummaryInfo } from "@/components/exercise/summary-info";
import { WorkoutSetsTable } from "@/components/exercise/workout-sets-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Check, ChevronRight, Clock, Dumbbell } from "lucide-react";

export const Route = createFileRoute("/exercises_/$exerciseId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { exerciseId } = Route.useParams();

	const exercise = useQuery(api.exercises.getById, {
		exerciseId: exerciseId as Id<"exercises">,
	});

	const currentWorkout = useQuery(api.workouts.getCurrentWorkout);
	const currentWorkoutSets = useQuery(
		api.exercises.getCurrentWorkoutSetsForExercise,
		{
			exerciseId: exerciseId as Id<"exercises">,
		},
	);
	const lastWorkoutSets = useQuery(api.exercises.getLastCompletedWorkoutSets, {
		exerciseId: exerciseId as Id<"exercises">,
	});

	const isFinished = useQuery(api.exercises.isFinishedInCurrentWorkout, {
		exerciseId: exerciseId as Id<"exercises">,
	});
	const toggleFinished = useMutation(api.exercises.toggleFinished);

	const relatedExercises = useQuery(
		api.exercises.getByMuscleGroup,
		exercise?.groupId ? { groupId: exercise.groupId } : "skip",
	);

	const deleteSet = useMutation(api.sets.deleteSet);

	const handleDeleteSet = async (setId: Id<"sets">) => {
		try {
			await deleteSet({ setId });
		} catch (error) {
			console.error("Failed to delete set:", error);
		}
	};

	if (exercise === undefined) {
		return (
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Skeleton className="h-6 w-48" />
					</div>
					<div className="flex gap-2">
						<Skeleton className="size-9 rounded-lg" />
						<Skeleton className="size-9 rounded-lg" />
					</div>
				</div>
				<div className="rounded-xl border bg-card p-4 shadow-sm">
					<Skeleton className="mb-4 h-6 w-24" />
					<div className="flex gap-4">
						<Skeleton className="h-10 flex-1" />
						<Skeleton className="h-10 flex-1" />
						<Skeleton className="size-10" />
					</div>
				</div>
				<div className="rounded-xl border bg-card p-4 shadow-sm">
					<Skeleton className="mb-4 h-6 w-32" />
					<Skeleton className="h-24" />
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<ExerciseBreadcrumbs />
					<EditExerciseDrawer exerciseId={exerciseId as Id<"exercises">} />
				</div>
				<div className="flex items-center gap-2">
					<NotesDrawer />
					{currentWorkout && (
						<Button
							variant={isFinished ? "default" : "outline"}
							size="icon"
							className={
								isFinished
									? "bg-success hover:bg-success/80 text-white"
									: ""
							}
							onClick={() =>
								toggleFinished({
									exerciseId: exerciseId as Id<"exercises">,
								})
							}
						>
							<Check className="size-4" />
						</Button>
					)}
				</div>
			</div>

			{/* Add Set Form */}
			{currentWorkout && <ExerciseAddSetForm />}

			{/* Current Session */}
			{currentWorkout && (
				<Card className="border-primary/25 shadow-sm">
					<CardHeader className="pb-2">
						<div className="flex items-center gap-2">
							<div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
								<Dumbbell className="size-4 text-primary" />
							</div>
							<CardTitle className="font-display text-base font-semibold tracking-tight">
								Current Session
							</CardTitle>
							{currentWorkoutSets && currentWorkoutSets.length > 0 && (
								<Badge variant="secondary" className="ml-auto font-display">
									{currentWorkoutSets.length}{" "}
									{currentWorkoutSets.length === 1 ? "set" : "sets"}
								</Badge>
							)}
						</div>
					</CardHeader>
					<CardContent>
						<WorkoutSetsTable
							sets={currentWorkoutSets || []}
							comparisonSets={lastWorkoutSets || undefined}
							onDeleteSet={handleDeleteSet}
							emptyMessage="No sets in current session"
						/>
					</CardContent>
				</Card>
			)}

			{/* Records Summary */}
			<ExerciseSummaryInfo />

			{/* Last Workout */}
			<Card className="shadow-sm">
				<CardHeader className="pb-2">
					<div className="flex items-center gap-2">
						<div className="flex size-9 items-center justify-center rounded-lg bg-muted">
							<Clock className="size-4 text-muted-foreground" />
						</div>
						<CardTitle className="font-display text-base font-semibold tracking-tight">
							Previous Session
						</CardTitle>
						{lastWorkoutSets && lastWorkoutSets.length > 0 && (
							<Badge variant="outline" className="ml-auto font-display">
								{lastWorkoutSets.length}{" "}
								{lastWorkoutSets.length === 1 ? "set" : "sets"}
							</Badge>
						)}
					</div>
				</CardHeader>
				<CardContent>
					<WorkoutSetsTable
						sets={lastWorkoutSets || []}
						onDeleteSet={handleDeleteSet}
						emptyMessage="No sets from previous session"
					/>
				</CardContent>
			</Card>

			{/* Related Exercises */}
			{exercise && relatedExercises && relatedExercises.length > 1 && (
				<Card className="shadow-sm">
					<CardHeader className="pb-2">
						<CardTitle className="font-display text-base font-semibold tracking-tight">
							Related Exercises
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid gap-2 sm:grid-cols-2">
							{relatedExercises
								.filter(
									(relatedExercise) => relatedExercise._id !== exercise._id,
								)
								.map((relatedExercise) => (
									<Link
										key={relatedExercise._id}
										to="/exercises/$exerciseId"
										params={{ exerciseId: relatedExercise._id }}
										className="group flex items-center justify-between rounded-lg border bg-background/60 p-3 transition-all duration-200 hover:border-primary/30 hover:bg-accent/50"
									>
										<span className="text-sm font-medium transition-colors group-hover:text-primary">
											{relatedExercise.name}
										</span>
										<ChevronRight className="size-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
									</Link>
								))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
