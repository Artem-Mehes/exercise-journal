import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { Store, useStore } from "@tanstack/react-store";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import { CheckCircle, ChevronRight, Dumbbell } from "lucide-react";
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
			<div className="space-y-3">
				{[...Array(5)].map((_, i) => (
					<div key={i} className="rounded-xl border bg-card p-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Skeleton className="size-9 rounded-lg" />
								<Skeleton className="h-5 w-32" />
							</div>
							<Skeleton className="h-6 w-14 rounded-full" />
						</div>
					</div>
				))}
			</div>
		);
	}

	return (
		<Accordion
			type="multiple"
			className="w-full space-y-3"
			value={openedGroups}
			onValueChange={(value) => {
				updateOpenedGroups(value);
			}}
		>
			{muscleGroups.map((muscleGroup) => {
				const totalCount = muscleGroup.exercises.length;
				const activeCount = muscleGroup.exercises.filter(
					(e) =>
						("currentSetsCount" in e &&
							(e.currentSetsCount as number) > 0) ||
						("isFinished" in e && e.isFinished),
				).length;
				const hasActiveWorkout = muscleGroup.exercises.some(
					(e) => "currentSetsCount" in e,
				);
				const progressPercent =
					totalCount > 0 ? (activeCount / totalCount) * 100 : 0;

				return (
					<AccordionItem
						key={muscleGroup._id}
						value={muscleGroup._id}
						className="rounded-xl border border-border/60 bg-card px-4 shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden"
					>
						<AccordionTrigger className="py-4 hover:no-underline">
							<div className="flex w-full flex-col gap-2 pr-2">
								<div className="flex w-full items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors">
											<Dumbbell className="size-4" />
										</div>
										<span className="font-display text-base font-semibold tracking-tight">
											{muscleGroup.name}
										</span>
									</div>
									<Badge
										variant="secondary"
										className="ml-auto mr-2 tabular-nums font-display text-xs"
									>
										{activeCount}/{totalCount}
									</Badge>
								</div>
								{hasActiveWorkout && totalCount > 0 && (
									<div className="ml-12 mr-2 h-1 overflow-hidden rounded-full bg-muted">
										<div
											className="h-full rounded-full transition-all duration-500 ease-out bg-primary"
											style={{ width: `${progressPercent}%` }}
										/>
									</div>
								)}
							</div>
						</AccordionTrigger>
						<AccordionContent className="pb-4">
							<div className="grid gap-2 sm:grid-cols-2">
								{muscleGroup.exercises.map((exercise) => {
									const currentSets =
										"currentSetsCount" in exercise
											? (exercise.currentSetsCount as number)
											: 0;
									const isActive = currentSets > 0;
									const isFinished =
										"isFinished" in exercise && exercise.isFinished;

									return (
										<Link
											key={exercise._id}
											to="/exercises/$exerciseId"
											params={{ exerciseId: exercise._id }}
											className={`group flex items-center justify-between rounded-lg border bg-background/60 px-3.5 py-3 transition-all duration-200 hover:bg-accent/50 hover:border-primary/30 hover:shadow-sm min-h-14 ${isFinished ? "border-success/30 bg-success/5" : ""}`}
										>
											<div className="flex flex-col gap-1 min-w-0">
												<span
													className={`font-medium transition-colors truncate ${isFinished ? "text-success line-through" : "text-foreground group-hover:text-primary"}`}
												>
													{exercise.name}
												</span>
												{isActive && (
													<span
														className={`text-xs tabular-nums ${isFinished ? "text-success/70" : "text-muted-foreground"}`}
													>
														{currentSets} {currentSets === 1 ? "set" : "sets"}
													</span>
												)}
											</div>
											<div className="flex items-center gap-2 ml-2 shrink-0">
												{isFinished ? (
													<CheckCircle className="size-4 text-success" />
												) : (
													<ChevronRight className="size-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
												)}
											</div>
										</Link>
									);
								})}
							</div>
						</AccordionContent>
					</AccordionItem>
				);
			})}
		</Accordion>
	);
}
