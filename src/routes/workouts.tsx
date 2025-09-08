import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkoutSummaryTable } from "@/components/workouts/workout-summary-table";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Group, Trash2 } from "lucide-react";

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
				<Skeleton className="h-30 w-full" />
				<Skeleton className="h-30 w-full" />
				<Skeleton className="h-30 w-full" />
				<Skeleton className="h-30 w-full" />
				<Skeleton className="h-30 w-full" />
			</div>
		);
	}

	return (
		<>
			<h1 className="text-2xl font-bold">Workouts</h1>

			<div className="space-y-4">
				{workouts?.map((workout) => (
					<Card key={workout._id}>
						<CardHeader>
							<CardTitle className="flex justify-between items-center">
								<div>
									<span>
										{new Date(workout.startTime).toLocaleDateString(undefined, {
											weekday: "long",
											day: "numeric",
											month: "short",
										})}
									</span>

									<span className="text-muted-foreground text-sm ml-2">
										{workout.endTime
											? calculateDuration(workout.startTime, workout.endTime)
											: "Ongoing"}
									</span>
								</div>

								<Button
									variant="ghost"
									size="sm"
									className="text-destructive"
									onClick={() => deleteWorkout({ workoutId: workout._id })}
								>
									<Trash2 />
								</Button>
							</CardTitle>
						</CardHeader>

						<CardContent className="space-y-2">
							<div className="flex items-start gap-2 text-sm">
								<Group className="size-5 text-muted-foreground" />
								<span className="text-muted-foreground">Groups:</span>
								<div className="flex flex-wrap gap-1">
									{workout.groups.map((group, index) => (
										<Badge key={index} className="text-xs">
											{group}
										</Badge>
									))}
								</div>
							</div>

							<WorkoutSummaryTable workoutId={workout._id} />
						</CardContent>
					</Card>
				))}
			</div>
		</>
	);
}
