import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useMutation, useQuery } from "convex/react";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	const exercises = useQuery(api.exercises.get);

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
		<div className="flex w-full max-w-sm flex-col gap-6">
			<Tabs defaultValue="add-exercise">
				<TabsList>
					<TabsTrigger value="add-exercise">Add Exercise</TabsTrigger>
					<TabsTrigger value="exercises">Exercises List</TabsTrigger>
				</TabsList>
				<TabsContent value="add-exercise">
					<Card className="h-80">
						<form
							onSubmit={async (e) => {
								e.preventDefault();
								e.stopPropagation();
								await form.handleSubmit();
								form.reset();
							}}
							className="flex flex-col gap-6"
						>
							<CardContent className="grid gap-3">
								<Label htmlFor="exercise-name">Exercise Name</Label>
								<form.Field name="name">
									{(field) => (
										<Input
											id="exercise-name"
											placeholder="Add exercise name"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
									)}
								</form.Field>
							</CardContent>
							<CardFooter>
								<form.Subscribe
									selector={(state) => [state.canSubmit, state.isSubmitting]}
								>
									{([canSubmit, isSubmitting]) => (
										<Button type="submit" disabled={!canSubmit}>
											{isSubmitting ? "..." : "Add Exercise"}
										</Button>
									)}
								</form.Subscribe>
							</CardFooter>
						</form>
					</Card>
				</TabsContent>

				<TabsContent value="exercises">
					<Card className="h-80">
						<CardContent>
							<ul>
								{exercises?.map((exercise) => (
									<li key={exercise._id}>{exercise.name}</li>
								))}
							</ul>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
