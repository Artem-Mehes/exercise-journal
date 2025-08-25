import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useMutation, useQuery } from "convex/react";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	const exercises = useQuery(api.exercises.get);

	const createExercise = useMutation(api.exercises.create);

	return (
		<div className="text-center">
			<div>List of exercises</div>

			{exercises?.map((exercise) => (
				<div key={exercise._id}>{exercise.name}</div>
			))}
		</div>
	);
}
