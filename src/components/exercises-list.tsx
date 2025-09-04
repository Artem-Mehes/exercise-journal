import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";

export function ExercisesList() {
	const muscleGroups = useQuery(api.exerciseGroups.getAllWithExercises);

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

	return (
		<Accordion
			type="single"
			collapsible
			className="w-full"
			defaultValue={muscleGroups[0]._id}
		>
			{muscleGroups.map((muscleGroup) => (
				<AccordionItem key={muscleGroup._id} value={muscleGroup._id}>
					<AccordionTrigger className="text-xl items-center">
						{muscleGroup.name}
					</AccordionTrigger>
					<AccordionContent>
						<ul className="grid grid-cols-2 gap-3">
							{muscleGroup.exercises.map((exercise) => (
								<li key={exercise._id}>
									<Link
										to="/exercises/$exerciseId"
										params={{ exerciseId: exercise._id }}
										className="flex items-center gap-2 underline"
									>
										{exercise.name}
									</Link>
								</li>
							))}
						</ul>
					</AccordionContent>
				</AccordionItem>
			))}
		</Accordion>
	);
}
