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
import { CheckCircle2, ChevronRight, Dumbbell } from "lucide-react";
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
					<div key={i} className="rounded-lg border bg-card p-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Skeleton className="size-5 rounded" />
								<Skeleton className="h-5 w-32" />
							</div>
							<Skeleton className="h-5 w-12 rounded-full" />
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
				const isFullyCompleted = completedCount === totalCount && totalCount > 0;

				return (
					<AccordionItem
						key={muscleGroup._id}
						value={muscleGroup._id}
						className={cn(
							"rounded-lg border bg-card px-4 shadow-sm transition-shadow hover:shadow-md",
							isFullyCompleted && "border-success/30 bg-success/5",
						)}
					>
						<AccordionTrigger className="py-4 hover:no-underline">
							<div className="flex w-full items-center justify-between pr-2">
								<div className="flex items-center gap-3">
									<div
										className={cn(
											"flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary",
											isFullyCompleted && "bg-success/10 text-success",
										)}
									>
										<Dumbbell className="size-4" />
									</div>
									<span className="text-base font-semibold">
										{muscleGroup.name}
									</span>
								</div>
								<Badge
									variant={isFullyCompleted ? "default" : "secondary"}
									className={cn(
										"ml-auto mr-2 tabular-nums",
										isFullyCompleted && "bg-success text-white",
									)}
								>
									{completedCount}/{totalCount}
								</Badge>
							</div>
						</AccordionTrigger>
						<AccordionContent className="pb-4">
							<div className="grid gap-2 sm:grid-cols-2">
								{muscleGroup.exercises.map((exercise) => (
									<Link
										key={exercise._id}
										to="/exercises/$exerciseId"
										params={{ exerciseId: exercise._id }}
										className={cn(
											"group flex items-center justify-between rounded-md border bg-background p-3 transition-all hover:border-primary/50 hover:bg-accent",
											exercise.isFinished &&
												"border-success/20 bg-success/5 hover:border-success/40 hover:bg-success/10",
										)}
									>
										<span
											className={cn(
												"font-medium text-foreground transition-colors group-hover:text-primary",
												exercise.isFinished &&
													"text-muted-foreground group-hover:text-success",
											)}
										>
											{exercise.name}
										</span>
										<div className="flex items-center gap-2">
											{exercise.isFinished ? (
												<CheckCircle2 className="size-5 text-success" />
											) : (
												<ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
											)}
										</div>
									</Link>
								))}
							</div>
						</AccordionContent>
					</AccordionItem>
				);
			})}
		</Accordion>
	);
}
