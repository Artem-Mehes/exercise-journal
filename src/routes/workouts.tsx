import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkoutSummaryTable } from "@/components/workouts/workout-summary-table";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Calendar, Clock, Group, Trash2 } from "lucide-react";

export const Route = createFileRoute("/workouts")({
	component: RouteComponent,
});

function calculateDuration(startTime: number, endTime: number): string {
	const durationMs = endTime - startTime;
	const totalMinutes = Math.floor(durationMs / (1000 * 60));
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;

	if (hours > 0) {
		return `${hours}h ${minutes}m`;
	}
	return `${minutes}m`;
}

function RouteComponent() {
	const workouts = useQuery(api.workouts.getAll);

	const deleteWorkout = useMutation(api.workouts.deleteWorkout);

	if (workouts === undefined) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-8 w-40" />
				{[...Array(3)].map((_, i) => (
					<Skeleton key={i} className="h-48 w-full rounded-xl" />
				))}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-bold tracking-tight">Workouts</h1>

			{workouts.length === 0 ? (
				<div className="py-16 text-center">
					<Calendar className="size-10 mx-auto text-muted-foreground/40 mb-3" />
					<p className="text-muted-foreground">No workouts recorded yet.</p>
				</div>
			) : (
				<div className="space-y-4">
					{workouts?.map((workout) => (
						<Card key={workout._id} className="shadow-sm overflow-hidden">
							<CardHeader className="pb-2">
								<CardTitle className="flex justify-between items-center">
									<div className="flex items-center gap-3">
										<div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
											<Calendar className="size-4 text-primary" />
										</div>
										<div>
											<span className="font-display text-base font-semibold tracking-tight">
												{new Date(workout.startTime).toLocaleDateString(
													undefined,
													{
														weekday: "long",
														day: "numeric",
														month: "short",
													},
												)}
											</span>
											<div className="flex items-center gap-1.5 text-muted-foreground text-xs mt-0.5">
												<Clock className="size-3" />
												<span>
													{workout.endTime
														? calculateDuration(
																workout.startTime,
																workout.endTime,
															)
														: "Ongoing"}
												</span>
											</div>
										</div>
									</div>

									<Button
										variant="ghost"
										size="sm"
										className="text-destructive hover:text-destructive"
										onClick={() => deleteWorkout({ workoutId: workout._id })}
									>
										<Trash2 className="size-4" />
									</Button>
								</CardTitle>
							</CardHeader>

							<CardContent className="space-y-3">
								<div className="flex items-center gap-2 flex-wrap">
									<Group className="size-4 text-muted-foreground shrink-0" />
									{workout.groups.map((group, index) => (
										<Badge
											key={index}
											variant="secondary"
											className="text-xs font-display"
										>
											{group}
										</Badge>
									))}
								</div>

								<WorkoutSummaryTable workoutId={workout._id} />
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
