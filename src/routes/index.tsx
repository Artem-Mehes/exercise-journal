import { useAppForm } from "@/hooks/form";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useMutation } from "convex/react";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	const createExercise = useMutation(api.exercises.create);

	const form = useAppForm({
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
				className="flex flex-col gap-6 "
			>
				<form.AppField name="name">
					{(field) => <field.TextField label="Exercise name" />}
				</form.AppField>

				<form.AppForm>
					<form.SubscribeButton label="Create" />
				</form.AppForm>
			</form>
		</>
	);
}
