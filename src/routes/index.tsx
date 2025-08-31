import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Check, Plus, X } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	const exercises = useQuery(api.exercises.get);
	const createExercise = useMutation(api.exercises.create);
	const [showInputFor, setShowInputFor] = useState<string | null>(null);
	const [newExerciseName, setNewExerciseName] = useState("");
	const [isCreating, setIsCreating] = useState(false);

	if (exercises === undefined) {
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

	const groupedExercises = exercises.reduce(
		(acc, exercise) => {
			// Skip exercises without muscle groups since they're now required
			if (!exercise.muscleGroup?.name) return acc;

			const groupName = exercise.muscleGroup.name;
			if (!acc[groupName]) {
				acc[groupName] = {
					exercises: [],
					muscleGroupId: exercise.muscleGroupId,
				};
			}
			acc[groupName].exercises.push(exercise);
			return acc;
		},
		{} as Record<
			string,
			{ exercises: typeof exercises; muscleGroupId: Id<"muscleGroups"> }
		>,
	);

	const sortedGroups = Object.keys(groupedExercises).sort((a, b) =>
		a.localeCompare(b),
	);

	const handleShowInput = (groupName: string) => {
		setShowInputFor(groupName);
		setNewExerciseName("");
	};

	const handleCancelInput = () => {
		setShowInputFor(null);
		setNewExerciseName("");
	};

	const handleCreateExercise = async (groupName: string) => {
		if (!newExerciseName.trim()) return;

		const group = groupedExercises[groupName];
		if (!group.muscleGroupId) return;

		setIsCreating(true);
		try {
			await createExercise({
				name: newExerciseName.trim(),
				muscleGroupId: group.muscleGroupId,
			});

			// Reset state after successful creation
			setShowInputFor(null);
			setNewExerciseName("");
		} catch (error) {
			console.error("Failed to create exercise:", error);
			alert("Failed to create exercise. Please try again.");
		} finally {
			setIsCreating(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent, groupName: string) => {
		if (e.key === "Enter") {
			handleCreateExercise(groupName);
		} else if (e.key === "Escape") {
			handleCancelInput();
		}
	};

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Exercises</h1>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{sortedGroups.map((groupName) => (
					<Card key={groupName}>
						<CardHeader className="flex items-center justify-between min-h-10">
							<CardTitle className="text-lg">{groupName}</CardTitle>
							{showInputFor !== groupName && (
								<Button
									size="icon"
									variant="ghost"
									onClick={() => handleShowInput(groupName)}
								>
									<Plus />
								</Button>
							)}
						</CardHeader>
						<CardContent>
							{showInputFor === groupName && (
								<div className="flex gap-2 items-center mb-4">
									<Input
										placeholder="Enter exercise name..."
										value={newExerciseName}
										onChange={(e) => setNewExerciseName(e.target.value)}
										onKeyDown={(e) => handleKeyPress(e, groupName)}
										autoFocus
										className="h-7 text-sm"
									/>
									<Button
										className="size-7"
										onClick={() => handleCreateExercise(groupName)}
										disabled={isCreating || !newExerciseName.trim()}
									>
										<Check />
									</Button>
									<Button
										className="size-7"
										variant="outline"
										onClick={handleCancelInput}
										disabled={isCreating}
									>
										<X />
									</Button>
								</div>
							)}
							<ul className="space-y-2">
								{groupedExercises[groupName].exercises.map((exercise) => (
									<li key={exercise._id}>
										<Link
											to="/exercises/$exerciseId"
											params={{ exerciseId: exercise._id }}
											className="text-sm block px-2 py-1 rounded-sm border border-gray-200 bg-zinc-300 hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200 text-gray-800 hover:text-blue-700 font-medium"
										>
											{exercise.name}
										</Link>
									</li>
								))}
							</ul>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
