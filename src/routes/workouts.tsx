import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";

// export const Route = createFileRoute("/workouts")({
// 	component: RouteComponent,
// });

function RouteComponent() {
	const workouts = useQuery(api.workouts.getWithExercises);

	if (workouts === undefined) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-8 w-48" />
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					<Skeleton className="h-32" />
					<Skeleton className="h-32" />
					<Skeleton className="h-32" />
				</div>
			</div>
		);
	}

	if (workouts.length === 0) {
		return (
			<div className="text-center py-12">
				<h1 className="text-2xl font-bold mb-4">Workouts</h1>
				<p className="text-muted-foreground">
					No workouts created yet. Create your first workout to get started!
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Workouts</h1>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{workouts.map((workout) => (
					<Card key={workout._id} className="hover:shadow-md transition-shadow">
						<CardHeader>
							<CardTitle className="text-lg">{workout.name}</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<p className="text-sm text-muted-foreground font-medium">
									Exercises ({workout.exerciseDetails.length}):
								</p>
								{workout.exerciseDetails.length > 0 ? (
									<ul className="space-y-1">
										{workout.exerciseDetails.map((exercise) => (
											<li
												key={exercise?._id}
												className="text-sm bg-secondary/50 px-2 py-1 rounded"
											>
												{exercise?.name}
											</li>
										))}
									</ul>
								) : (
									<p className="text-sm text-muted-foreground italic">
										No exercises in this workout
									</p>
								)}
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
