import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useMutation } from "convex/react";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	const createExercise = useMutation(api.exercises.create);

	const form = useForm({
		defaultValues: {
			name: "",
		},

		onSubmit: async ({ value }) => {
			createExercise({ name: value.name.trim() });
		},
	});

	return (
		<>
			<h1 className="text-2xl font-bold">Create Exercise</h1>

			<form
				onSubmit={async (e) => {
					e.preventDefault();
					e.stopPropagation();
					await form.handleSubmit();
					form.reset();
				}}
				className="flex flex-col gap-6"
			>
				<form.Field name="name">
					{(field) => (
						<Input
							id="exercise-name"
							placeholder="Exercise name"
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
					)}
				</form.Field>
				<form.Subscribe
					selector={(state) => [state.canSubmit, state.isSubmitting]}
				>
					{([canSubmit, isSubmitting]) => (
						<Button type="submit" disabled={!canSubmit}>
							{isSubmitting ? "..." : "Create"}
						</Button>
					)}
				</form.Subscribe>
			</form>
		</>
	);
}
