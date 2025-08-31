import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Check, Plus, PlusCircle, X } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	const muscleGroups = useQuery(api.muscleGroups.getAllWithExercises);
	const createExercise = useMutation(api.exercises.create);
	const [showInputFor, setShowInputFor] = useState<Id<"muscleGroups"> | null>(
		null,
	);
	const [newExerciseName, setNewExerciseName] = useState("");
	const [isCreating, setIsCreating] = useState(false);
	const [newMuscleGroupName, setNewMuscleGroupName] = useState("");
	const [showInputForMuscleGroup, setShowInputForMuscleGroup] =
		useState<boolean>();

	const createMuscleGroup = useMutation(api.muscleGroups.create);

	if (muscleGroups === undefined) {
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

	const handleShowInput = (muscleGroupId: Id<"muscleGroups">) => {
		setShowInputFor(muscleGroupId);
		setNewExerciseName("");
	};

	const handleCancelInput = () => {
		setShowInputFor(null);
		setNewExerciseName("");
	};

	const handleCreateExercise = async (muscleGroupId: Id<"muscleGroups">) => {
		if (!newExerciseName.trim()) return;

		setIsCreating(true);
		try {
			await createExercise({
				name: newExerciseName.trim(),
				muscleGroupId: muscleGroupId,
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

	const handleKeyPress = (
		e: React.KeyboardEvent,
		muscleGroupId: Id<"muscleGroups">,
	) => {
		if (e.key === "Enter") {
			handleCreateExercise(muscleGroupId);
		} else if (e.key === "Escape") {
			handleCancelInput();
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-4">
				<h1 className="text-2xl font-bold">Exercises</h1>

				{showInputForMuscleGroup ? (
					<div className="flex items-center gap-2">
						<Input
							value={newMuscleGroupName}
							onChange={(e) => setNewMuscleGroupName(e.target.value)}
							autoFocus
							placeholder="Name"
						/>

						<Button
							variant="outline"
							onClick={() => setShowInputForMuscleGroup(false)}
						>
							<X />
						</Button>
						<Button
							onClick={async () => {
								await createMuscleGroup({ name: newMuscleGroupName });
								setShowInputForMuscleGroup(false);
								setNewMuscleGroupName("");
							}}
						>
							<Check />
						</Button>
					</div>
				) : (
					<Button
						variant="ghost"
						onClick={() => setShowInputForMuscleGroup(true)}
					>
						<PlusCircle />
						Add muscle group
					</Button>
				)}
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{muscleGroups.map((muscleGroup) => (
					<Card key={muscleGroup._id} className="py-0 pt-2 pb-4">
						<CardHeader className="flex items-center justify-between min-h-10">
							<CardTitle className="text-lg">{muscleGroup.name}</CardTitle>
							{showInputFor !== muscleGroup._id && (
								<Button
									size="icon"
									variant="ghost"
									onClick={() => handleShowInput(muscleGroup._id)}
								>
									<Plus />
								</Button>
							)}
						</CardHeader>
						<CardContent>
							{showInputFor === muscleGroup._id && (
								<div className="flex gap-2 items-center mb-4">
									<Input
										placeholder="Enter exercise name..."
										value={newExerciseName}
										onChange={(e) => setNewExerciseName(e.target.value)}
										onKeyDown={(e) => handleKeyPress(e, muscleGroup._id)}
										autoFocus
										className="h-7 text-sm"
									/>
									<Button
										className="size-7"
										onClick={() => handleCreateExercise(muscleGroup._id)}
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
								{muscleGroup.exercises.map((exercise) => (
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
