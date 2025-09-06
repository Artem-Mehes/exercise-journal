import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Trash2 } from "lucide-react";

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
		<div className="space-y-4">
			{workouts?.map((workout) => (
				<Card key={workout._id}>
					<CardHeader>
						<CardTitle className="flex justify-between items-center">
							<span>
								{new Date(workout.startTime).toLocaleDateString()}

								<span className="text-muted-foreground text-sm ml-2">
									{workout.endTime
										? calculateDuration(workout.startTime, workout.endTime)
										: "Ongoing"}
								</span>
							</span>

							<Button
								variant="ghost"
								size="sm"
								className="text-destructive"
								onClick={() => deleteWorkout({ workoutId: workout._id })}
							>
								<Trash2 />
							</Button>
						</CardTitle>

						<CardContent>
							<span className="text-muted-foreground text-sm ml-2">
								Total Volume: {workout.totalVolume}
							</span>
						</CardContent>
					</CardHeader>
				</Card>
			))}
		</div>
	);
}
