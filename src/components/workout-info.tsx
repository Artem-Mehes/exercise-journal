import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useWorkoutTimer } from "../hooks/use-workout-timer";
import { Button } from "./ui/button";

export function WorkoutInfo() {
	const currentWorkout = useQuery(api.workouts.getCurrentWorkout);
	const startWorkout = useMutation(api.workouts.startWorkout);
	const endCurrentWorkout = useMutation(api.workouts.endCurrentWorkout);

	const { formattedTime } = useWorkoutTimer(currentWorkout?.startTime || null);

	const handleStartWorkout = async () => {
		try {
			await startWorkout();
		} catch (error) {
			console.error("Failed to start workout:", error);
		}
	};

	const handleEndWorkout = async () => {
		try {
			await endCurrentWorkout();
		} catch (error) {
			console.error("Failed to end workout:", error);
		}
	};

	const isLoading = currentWorkout === undefined;

	const isWorkoutActive = currentWorkout && !currentWorkout.endTime;

	return (
		<div className="flex items-center gap-4">
			{isWorkoutActive ? (
				<>
					<div className="flex items-center gap-2">
						<span className="text-xs">
							Exercises: {currentWorkout.exercises?.length || 0}
						</span>

						<div className="text-muted-foreground">{formattedTime}</div>
					</div>

					<Button variant="destructive" onClick={handleEndWorkout}>
						End workout
					</Button>
				</>
			) : (
				<Button
					variant="success"
					onClick={handleStartWorkout}
					isLoading={isLoading}
					className="min-w-28"
				>
					Start workout
				</Button>
			)}
		</div>
	);
}
