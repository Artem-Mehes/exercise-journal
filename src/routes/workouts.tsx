import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";

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

	return (
		<div className="space-y-4">
			{workouts?.map((workout) => (
				<Card key={workout._id}>
					<CardHeader>
						<CardTitle>
							{new Date(workout.startTime).toLocaleDateString()}

							<span className="text-muted-foreground text-sm ml-2">
								{workout.endTime
									? calculateDuration(workout.startTime, workout.endTime)
									: "Ongoing"}
							</span>
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
