import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Store, useStore } from "@tanstack/react-store";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import { CheckCircle2, ChevronRight, Dumbbell, Target } from "lucide-react";
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

function ProgressDots({ current, goal }: { current: number; goal: number }) {
	const dots = Array.from({ length: goal }, (_, i) => i < current);

	return (
		<div className="flex items-center gap-1">
			{dots.map((filled, i) => (
				<div
					key={i}
					className={cn(
						"size-1.5 rounded-full transition-colors",
						filled ? "bg-primary" : "bg-muted-foreground/25",
					)}
				/>
			))}
		</div>
	);
}

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
				const completedCount = muscleGroup.exercises.filter(
					(e) => e.isFinished,
				).length;
				const totalCount = muscleGroup.exercises.length;
				const isFullyCompleted =
					completedCount === totalCount && totalCount > 0;
				const hasActiveWorkout = muscleGroup.exercises.some(
					(e) => e.isFinished !== undefined,
				);
				const progressPercent =
					totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

				return (
					<AccordionItem
						key={muscleGroup._id}
						value={muscleGroup._id}
						className={cn(
							"rounded-xl border bg-card px-4 shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden",
							isFullyCompleted
								? "border-success/30 bg-success/5"
								: "border-border/60",
						)}
					>
						<AccordionTrigger className="py-4 hover:no-underline">
							<div className="flex w-full flex-col gap-2 pr-2">
								<div className="flex w-full items-center justify-between">
									<div className="flex items-center gap-3">
										<div
											className={cn(
												"flex size-9 items-center justify-center rounded-lg transition-colors",
												isFullyCompleted
													? "bg-success/15 text-success"
													: "bg-primary/10 text-primary",
											)}
										>
											<Dumbbell className="size-4" />
										</div>
										<span className="font-display text-base font-semibold tracking-tight">
											{muscleGroup.name}
										</span>
									</div>
									<Badge
										variant={isFullyCompleted ? "default" : "secondary"}
										className={cn(
											"ml-auto mr-2 tabular-nums font-display text-xs",
											isFullyCompleted && "bg-success text-white",
										)}
									>
										{completedCount}/{totalCount}
									</Badge>
								</div>
								{hasActiveWorkout && totalCount > 0 && (
									<div className="ml-12 mr-2 h-1 overflow-hidden rounded-full bg-muted">
										<div
											className={cn(
												"h-full rounded-full transition-all duration-500 ease-out",
												isFullyCompleted ? "bg-success" : "bg-primary",
											)}
											style={{ width: `${progressPercent}%` }}
										/>
									</div>
								)}
							</div>
						</AccordionTrigger>
						<AccordionContent className="pb-4">
							<div className="grid gap-2 sm:grid-cols-2">
								{muscleGroup.exercises.map((exercise) => {
									const hasGoal = !!exercise.setsGoal;
									const isActive = exercise.isFinished !== undefined;
									const currentSets =
										"currentSetsCount" in exercise
											? (exercise.currentSetsCount as number)
											: 0;

									return (
										<Link
											key={exercise._id}
											to="/exercises/$exerciseId"
											params={{ exerciseId: exercise._id }}
											className={cn(
												"group flex items-center justify-between rounded-lg border bg-background/60 px-3.5 py-3 transition-all duration-200 hover:bg-accent/50 hover:border-primary/30 hover:shadow-sm min-h-14",
												exercise.isFinished &&
													"border-success/20 bg-success/5 hover:border-success/40 hover:bg-success/10",
											)}
										>
											<div className="flex flex-col gap-1 min-w-0">
												<span
													className={cn(
														"font-medium text-foreground transition-colors group-hover:text-primary truncate",
														exercise.isFinished &&
															"text-muted-foreground group-hover:text-success",
													)}
												>
													{exercise.name}
												</span>
												{hasGoal && (
													<div className="flex items-center gap-2">
														{isActive ? (
															<>
																<ProgressDots
																	current={currentSets}
																	goal={exercise.setsGoal || 3}
																/>
																<span
																	className={cn(
																		"text-xs tabular-nums text-muted-foreground",
																		exercise.isFinished && "text-success/70",
																	)}
																>
																	{currentSets}/{exercise.setsGoal}
																</span>
															</>
														) : (
															<span className="flex items-center gap-1 text-xs text-muted-foreground/70">
																<Target className="size-3" />
																{exercise.setsGoal} sets
															</span>
														)}
													</div>
												)}
											</div>
											<div className="flex items-center gap-2 ml-2 shrink-0">
												{exercise.isFinished ? (
													<CheckCircle2 className="size-5 text-success" />
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
