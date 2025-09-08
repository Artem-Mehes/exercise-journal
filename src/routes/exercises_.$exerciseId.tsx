import { ExerciseAddSetForm } from "@/components/exercise/add-set-form";
import { ExerciseBreadcrumbs } from "@/components/exercise/breadcrumbs";
import { EditExerciseDrawer } from "@/components/exercise/edit-exercise-drawer";
import { NotesDrawer } from "@/components/exercise/notes-drawer";
import { ExerciseSummaryInfo } from "@/components/exercise/summary-info";
import { WorkoutSetsTable } from "@/components/exercise/workout-sets-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, createFileRoute } from "@tanstack/react-router";
import clsx from "clsx";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { CheckCircle } from "lucide-react";

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

	const relatedExercises = useQuery(
		api.exercises.getByMuscleGroup,
		exercise?.groupId ? { groupId: exercise.groupId } : "skip",
	);

	const deleteSet = useMutation(api.exercises.deleteSet);

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
				<Skeleton className="h-10" />
				<Skeleton className="h-30" />
				<Skeleton className="h-30" />
				<Skeleton className="h-30" />
			</div>
		);
	}

	return (
		<>
			<div className="flex justify-between">
				<div className="flex items-center gap-3">
					<ExerciseBreadcrumbs />

					<EditExerciseDrawer exerciseId={exerciseId as Id<"exercises">} />
				</div>

				<NotesDrawer />
			</div>

			{currentWorkout && <ExerciseAddSetForm />}

			{currentWorkout && (
				<Card>
					<CardHeader>
						<CardTitle className="text-primary">Current Session</CardTitle>
					</CardHeader>
					<CardContent>
						<WorkoutSetsTable
							sets={currentWorkoutSets || []}
							comparisonSets={lastWorkoutSets || undefined}
							onDeleteSet={handleDeleteSet}
							showDeleteButton={true}
							emptyMessage="No sets in current session"
						/>
					</CardContent>
				</Card>
			)}

			<ExerciseSummaryInfo />

			<Card>
				<CardHeader>
					<CardTitle>Last Workout Sets</CardTitle>
				</CardHeader>
				<CardContent>
					<WorkoutSetsTable
						sets={lastWorkoutSets || []}
						onDeleteSet={handleDeleteSet}
						showDeleteButton={true}
						emptyMessage="No sets from last session"
					/>
				</CardContent>
			</Card>

			{exercise && relatedExercises && relatedExercises.length > 1 && (
				<Card>
					<CardHeader>
						<CardTitle>Related</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
							{relatedExercises
								.filter(
									(relatedExercise) => relatedExercise._id !== exercise._id,
								)
								.map((relatedExercise) => (
									<Link
										key={relatedExercise._id}
										to="/exercises/$exerciseId"
										params={{ exerciseId: relatedExercise._id }}
										className={clsx(
											"p-2 rounded-lg border text-center text-sm relative",
											relatedExercise.isFinished
												? "line-through border-success"
												: "bg-sidebar-accent/40",
										)}
									>
										{relatedExercise.name}

										{relatedExercise.isFinished && (
											<CheckCircle className="size-4 text-success absolute top-1 right-1" />
										)}
									</Link>
								))}
						</div>
					</CardContent>
				</Card>
			)}
		</>
	);
}
