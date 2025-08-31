import { useEffect, useState } from "react";

export function useWorkoutTimer(startTime: number | null) {
	const [elapsedTime, setElapsedTime] = useState(0);

	useEffect(() => {
		if (!startTime) {
			setElapsedTime(0);
			return;
		}

		const updateElapsedTime = () => {
			const now = Date.now();
			const elapsed = Math.floor((now - startTime) / 1000); // Convert to seconds
			setElapsedTime(elapsed);
		};

		// Update immediately
		updateElapsedTime();

		// Update every second
		const interval = setInterval(updateElapsedTime, 1000);

		return () => clearInterval(interval);
	}, [startTime]);

	const formatTime = (seconds: number): string => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const remainingSeconds = seconds % 60;

		if (hours > 0) {
			return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
				.toString()
				.padStart(2, "0")}`;
		}
		return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
	};

	return {
		elapsedTime,
		formattedTime: formatTime(elapsedTime),
		hours: Math.floor(elapsedTime / 3600),
		minutes: Math.floor((elapsedTime % 3600) / 60),
		seconds: elapsedTime % 60,
	};
}
