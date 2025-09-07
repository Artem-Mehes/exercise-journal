import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { Store, useStore } from "@tanstack/react-store";
import clsx from "clsx";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import { CheckCircle } from "lucide-react";
import { useEffect } from "react";

const store = new Store<{
	openedGroups: string[] | undefined;
}>({
	openedGroups: localStorage.getItem("openedGroups")
		? JSON.parse(localStorage.getItem("openedGroups") as string)
		: undefined,
});

const updateOpenedGroups = (openedGroups: string[]) => {
	localStorage.setItem("openedGroups", JSON.stringify(openedGroups));

	store.setState(() => {
		return {
			openedGroups,
		};
	});
};

export function ExercisesList() {
	const muscleGroups = useQuery(api.exerciseGroups.getAllWithExercises);

	const openedGroups = useStore(store, (state) => state.openedGroups);

	useEffect(() => {
		if (muscleGroups && !openedGroups) {
			updateOpenedGroups([muscleGroups[0]._id]);
		}
	}, [muscleGroups, openedGroups]);

	if (muscleGroups === undefined) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-10" />
				<Skeleton className="h-10" />
				<Skeleton className="h-10" />
				<Skeleton className="h-10" />
				<Skeleton className="h-10" />
				<Skeleton className="h-10" />
			</div>
		);
	}

	return (
		<Accordion
			type="multiple"
			className="w-full"
			value={openedGroups}
			onValueChange={(value) => {
				updateOpenedGroups(value);
			}}
		>
			{muscleGroups.map((muscleGroup) => (
				<AccordionItem key={muscleGroup._id} value={muscleGroup._id}>
					<AccordionTrigger className="text-xl items-center text-primary">
						{muscleGroup.name}
					</AccordionTrigger>
					<AccordionContent>
						<ul className="grid grid-cols-2 gap-3">
							{muscleGroup.exercises.map((exercise) => (
								<li key={exercise._id} className="flex items-center gap-1">
									<Link
										to="/exercises/$exerciseId"
										params={{ exerciseId: exercise._id }}
										className={clsx(
											"flex items-center gap-2",
											exercise.isFinished ? "line-through" : "underline",
										)}
									>
										{exercise.name}
									</Link>

									{exercise.isFinished && (
										<CheckCircle className="size-4 text-success" />
									)}
								</li>
							))}
						</ul>
					</AccordionContent>
				</AccordionItem>
			))}
		</Accordion>
	);
}
