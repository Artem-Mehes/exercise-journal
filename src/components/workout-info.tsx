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
		<div className="flex items-center gap-4 w-full">
			{isWorkoutActive ? (
				<div className="flex items-center justify-end w-full">
					<div className="flex items-center gap-3">
						<div className="flex items-center gap-2">
							<div className="size-2 rounded-full bg-primary animate-pulse-glow" />
							<span className="font-display text-sm font-semibold tabular-nums text-foreground tracking-wide">
								{formattedTime}
							</span>
						</div>

						<Button
							variant="destructive"
							size="sm"
							onClick={handleEndWorkout}
							className="font-display font-semibold tracking-wide"
						>
							End
						</Button>
					</div>
				</div>
			) : (
				<Button
					onClick={handleStartWorkout}
					isLoading={isLoading}
					className="min-w-28 ml-auto font-display font-semibold tracking-wide"
				>
					Start Workout
				</Button>
			)}
		</div>
	);
}
