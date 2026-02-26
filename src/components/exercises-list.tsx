import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { Store, useStore } from "@tanstack/react-store";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import { CheckCircle, ChevronRight, Dumbbell, SearchX } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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

export function ExercisesList({ searchQuery = "" }: { searchQuery?: string }) {
	const muscleGroups = useQuery(api.exerciseGroups.getAllWithExercises);

	const openedGroups = useStore(store, (state) => state.openedGroups);
	const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(
		new Set(),
	);

	const toggleGroup = (id: string) => {
		setSelectedGroupIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const query = searchQuery.trim().toLowerCase();
	const isSearching = query.length > 0;
	const isFiltering = selectedGroupIds.size > 0;

	const filteredGroups = useMemo(() => {
		if (!muscleGroups) return undefined;

		let groups = muscleGroups;

		if (isFiltering) {
			groups = groups.filter((g) => selectedGroupIds.has(g._id));
		}

		if (isSearching) {
			groups = groups
				.map((group) => {
					const groupNameMatches = group.name.toLowerCase().includes(query);
					if (groupNameMatches) return group;

					const matchingExercises = group.exercises.filter((e) =>
						e.name.toLowerCase().includes(query),
					);
					if (matchingExercises.length === 0) return null;
					return { ...group, exercises: matchingExercises };
				})
				.filter((g): g is NonNullable<typeof g> => g !== null);
		}

		return groups;
	}, [muscleGroups, query, isSearching, isFiltering, selectedGroupIds]);

	const accordionValue = isSearching
		? (filteredGroups?.map((g) => g._id) ?? [])
		: openedGroups;

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

	const hasNoResults =
		(isSearching || isFiltering) && filteredGroups?.length === 0;

	if (hasNoResults) {
		return (
			<>
				{muscleGroups && (
					<GroupChips
						groups={muscleGroups}
						selectedIds={selectedGroupIds}
						onToggle={toggleGroup}
					/>
				)}
				<div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
					<SearchX className="size-10 opacity-40" />
					<p className="text-sm">
						No exercises matching "{searchQuery.trim()}"
					</p>
				</div>
			</>
		);
	}

	return (
		<div className="space-y-3">
			{muscleGroups && (
				<GroupChips
					groups={muscleGroups}
					selectedIds={selectedGroupIds}
					onToggle={toggleGroup}
				/>
			)}
			<Accordion
				type="multiple"
				className="w-full space-y-3"
				value={accordionValue}
				onValueChange={(value) => {
					if (!isSearching) {
						updateOpenedGroups(value);
					}
				}}
			>
				{(filteredGroups ?? []).map((muscleGroup) => {
					const activeCount = muscleGroup.exercises.filter(
						(e) =>
							("currentSetsCount" in e && (e.currentSetsCount as number) > 0) ||
							("isFinished" in e && e.isFinished),
					).length;
					const hasActivity = activeCount > 0;
					const isMultiple = activeCount > 1;

					return (
						<AccordionItem
							key={muscleGroup._id}
							value={muscleGroup._id}
							className={`rounded-xl border px-4 shadow-sm transition-all duration-300 hover:shadow-md overflow-hidden ${
								isMultiple
									? "border-emerald-400/40 bg-emerald-400/[0.04] shadow-emerald-500/5"
									: hasActivity
										? "border-amber-400/30 bg-amber-400/[0.03]"
										: "border-border/60 bg-card"
							}`}
						>
							<AccordionTrigger className="py-4 hover:no-underline">
								<div className="flex w-full flex-col gap-2 pr-2">
									<div className="flex w-full items-center justify-between">
										<div className="flex items-center gap-3">
											<div
												className={`flex size-9 items-center justify-center rounded-lg transition-colors ${
													isMultiple
														? "bg-emerald-400/15 text-emerald-400"
														: hasActivity
															? "bg-amber-400/15 text-amber-400"
															: "bg-primary/10 text-primary"
												}`}
											>
												<Dumbbell className="size-4" />
											</div>
											<span className="font-display text-base font-semibold tracking-tight">
												{muscleGroup.name}
											</span>
										</div>
										{hasActivity && (
											<span
												className={`ml-auto mr-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums font-display transition-colors ${
													isMultiple
														? "bg-emerald-400/15 text-emerald-400"
														: "bg-amber-400/15 text-amber-400"
												}`}
											>
												<CheckCircle className="size-3" />
												{activeCount}
											</span>
										)}
									</div>
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
												params={{
													exerciseId: exercise._id,
												}}
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
		</div>
	);
}

function GroupChips({
	groups,
	selectedIds,
	onToggle,
}: {
	groups: Array<{ _id: string; name: string }>;
	selectedIds: Set<string>;
	onToggle: (id: string) => void;
}) {
	return (
		<div className="flex gap-2 flex-wrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]">
			{groups.map((group) => {
				const isActive = selectedIds.has(group._id);
				return (
					<button
						key={group._id}
						type="button"
						onClick={() => onToggle(group._id)}
						className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium border transition-all duration-150 active:scale-95 ${
							isActive
								? "bg-primary text-primary-foreground border-primary shadow-sm"
								: "bg-card border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
						}`}
					>
						{group.name}
					</button>
				);
			})}
		</div>
	);
}
