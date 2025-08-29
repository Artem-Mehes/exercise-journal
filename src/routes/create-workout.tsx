import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Doc, Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";

export const Route = createFileRoute("/create-workout")({
	component: RouteComponent,
});

function ExerciseSelector({
	selectedExercises,
	onExerciseToggle,
}: {
	selectedExercises: Id<"exercises">[];
	onExerciseToggle: (exerciseId: Id<"exercises">) => void;
}) {
	const exercises = useQuery(api.exercises.get);
	const [searchTerm, setSearchTerm] = useState("");

	const filteredExercises =
		exercises?.filter((exercise) =>
			exercise.name.toLowerCase().includes(searchTerm.toLowerCase()),
		) || [];

	if (!exercises) {
		return <div>Loading exercises...</div>;
	}

	return (
		<div className="space-y-4">
			<Input
				placeholder="Search exercises..."
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
			/>

			<div className="max-h-60 overflow-y-auto border rounded p-4 space-y-2">
				{filteredExercises.length === 0 ? (
					<div className="text-sm text-muted-foreground text-center py-4">
						{searchTerm
							? "No exercises found matching your search"
							: "No exercises available"}
					</div>
				) : (
					filteredExercises.map((exercise) => (
						<div key={exercise._id} className="flex items-center space-x-2">
							<Checkbox
								id={exercise._id}
								checked={selectedExercises.includes(exercise._id)}
								onCheckedChange={() => onExerciseToggle(exercise._id)}
							/>
							<label
								htmlFor={exercise._id}
								className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
							>
								{exercise.name}
							</label>
						</div>
					))
				)}
			</div>

			{selectedExercises.length > 0 && (
				<div className="text-sm text-muted-foreground">
					{selectedExercises.length} exercise(s) selected
				</div>
			)}
		</div>
	);
}

function RouteComponent() {
	const createWorkout = useMutation(api.workouts.create);

	const form = useForm({
		defaultValues: {
			name: "",
			exercises: [],
		} as Pick<Doc<"workouts">, "name" | "exercises">,
		onSubmit: async ({ value }) => {
			await createWorkout({
				name: value.name.trim(),
				exercises: value.exercises,
			});
			// Reset form after successful submission
			form.reset();
		},
	});

	const handleExerciseToggle = (exerciseId: Id<"exercises">) => {
		form.setFieldValue("exercises", (prev) => {
			if (prev.includes(exerciseId)) {
				return prev.filter((id) => id !== exerciseId);
			}
			return [...prev, exerciseId];
		});
	};

	return (
		<>
			<h1 className="text-2xl font-bold">Create Workout</h1>

			<form
				className="flex flex-col gap-6 h-full"
				onSubmit={async (e) => {
					e.preventDefault();
					e.stopPropagation();
					await form.handleSubmit();
				}}
			>
				<form.Field name="name">
					{(field) => (
						<div className="space-y-2">
							<label htmlFor="workout-name" className="text-sm font-medium">
								Workout Name
							</label>
							<Input
								id="workout-name"
								placeholder="Enter workout name..."
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
						</div>
					)}
				</form.Field>

				<form.Field name="exercises">
					{(field) => (
						<div className="space-y-2">
							<span className="text-sm font-medium">Select Exercises</span>
							<ExerciseSelector
								selectedExercises={field.state.value}
								onExerciseToggle={handleExerciseToggle}
							/>
						</div>
					)}
				</form.Field>

				<form.Subscribe
					selector={(state) => [state.canSubmit, state.isSubmitting]}
				>
					{([canSubmit, isSubmitting]) => (
						<Button type="submit" disabled={!canSubmit} className="mt-auto">
							{isSubmitting ? "Creating..." : "Create Workout"}
						</Button>
					)}
				</form.Subscribe>
			</form>
		</>
	);
}
