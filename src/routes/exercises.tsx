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

export const Route = createFileRoute("/exercises")({
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
			const groupName = exercise.muscleGroup?.name || "Unassigned";
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
			{ exercises: typeof exercises; muscleGroupId?: Id<"muscleGroups"> }
		>,
	);

	const sortedGroups = Object.keys(groupedExercises).sort((a, b) => {
		if (a === "Unassigned") return 1;
		if (b === "Unassigned") return -1;
		return a.localeCompare(b);
	});

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
		if (!group.muscleGroupId && groupName !== "Unassigned") return;

		setIsCreating(true);
		try {
			if (groupName === "Unassigned") {
				// For unassigned exercises, we need to create without muscle group
				// But the current schema requires muscleGroupId, so we'll skip this for now
				alert("Please assign exercises to a muscle group");
				return;
			}

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
						<CardHeader>
							<div className="flex items-center justify-between">
								<CardTitle className="text-lg">{groupName}</CardTitle>
								{groupName !== "Unassigned" && showInputFor !== groupName && (
									<Button
										size="icon"
										variant="ghost"
										onClick={() => handleShowInput(groupName)}
									>
										<Plus />
									</Button>
								)}
							</div>
						</CardHeader>
						<CardContent>
							{showInputFor === groupName && (
								<div className="mb-4 space-y-2">
									<div className="flex gap-2 items-center">
										<Input
											placeholder="Enter exercise name..."
											value={newExerciseName}
											onChange={(e) => setNewExerciseName(e.target.value)}
											onKeyDown={(e) => handleKeyPress(e, groupName)}
											className="flex-1"
											autoFocus
										/>
										<Button
											size="sm"
											onClick={() => handleCreateExercise(groupName)}
											disabled={isCreating || !newExerciseName.trim()}
										>
											<Check />
										</Button>
										<Button
											size="sm"
											variant="outline"
											onClick={handleCancelInput}
											disabled={isCreating}
										>
											<X />
										</Button>
									</div>
								</div>
							)}
							<ul className="space-y-2">
								{groupedExercises[groupName].exercises.map((exercise) => (
									<li key={exercise._id}>
										<Link
											to="/exercises/$exerciseId"
											params={{ exerciseId: exercise._id }}
											className="text-xs block p-2 rounded-lg border border-gray-200 bg-accent-foreground hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200 text-gray-800 hover:text-blue-700 font-medium"
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
