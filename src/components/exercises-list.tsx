import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { ExerciseRow } from "@/components/exercise-row";
import { cn } from "@/lib/utils";
import { Store, useStore } from "@tanstack/react-store";
import { api } from "convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Check, Dumbbell, SearchX } from "lucide-react";
import { useEffect, useMemo } from "react";

const store = new Store<{
	openedGroups: string[] | undefined;
	selectedGroupIds: string[];
}>({
	openedGroups: localStorage.getItem("openedGroups")
		? JSON.parse(localStorage.getItem("openedGroups") as string)
		: undefined,
	selectedGroupIds: localStorage.getItem("selectedGroupIds")
		? JSON.parse(localStorage.getItem("selectedGroupIds") as string)
		: [],
});

const updateOpenedGroups = (openedGroups: string[]) => {
	localStorage.setItem("openedGroups", JSON.stringify(openedGroups));

	store.setState((prev) => ({
		...prev,
		openedGroups,
	}));
};

const updateSelectedGroupIds = (ids: string[]) => {
	if (ids.length > 0) {
		localStorage.setItem("selectedGroupIds", JSON.stringify(ids));
	} else {
		localStorage.removeItem("selectedGroupIds");
	}

	store.setState((prev) => ({
		...prev,
		selectedGroupIds: ids,
	}));
};

export function ExercisesList({ searchQuery = "" }: { searchQuery?: string }) {
	const muscleGroups = useQuery(api.exerciseGroups.getAllWithExercises);
	const toggleFinished = useMutation(api.exercises.toggleFinished);

	const openedGroups = useStore(store, (state) => state.openedGroups);
	const selectedGroupIdsList = useStore(
		store,
		(state) => state.selectedGroupIds,
	);
	const selectedGroupIds = useMemo(
		() => new Set(selectedGroupIdsList),
		[selectedGroupIdsList],
	);

	const toggleGroup = (id: string) => {
		const next = new Set(selectedGroupIds);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		updateSelectedGroupIds([...next]);
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
					<div
						key={i}
						className="rounded-xl border-l-[3px] border-l-transparent bg-card/70 p-4"
					>
						<div className="flex items-center gap-3">
							<Skeleton className="size-9 rounded-lg" />
							<div className="flex-1 space-y-2.5">
								<div className="flex items-center justify-between">
									<Skeleton className="h-4 w-28" />
									<Skeleton className="h-4 w-10 rounded-full" />
								</div>
								<Skeleton className="h-[3px] w-full rounded-full" />
							</div>
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
				<div className="flex flex-col items-center justify-center gap-4 py-16 text-muted-foreground">
					<div className="flex size-14 items-center justify-center rounded-2xl bg-muted/60">
						<SearchX className="size-7 opacity-40" />
					</div>
					<div className="space-y-1 text-center">
						<p className="text-sm font-medium text-foreground/70">
							No exercises found
						</p>
						<p className="text-xs text-muted-foreground/60">
							Try adjusting your search or filters
						</p>
					</div>
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
				className="w-full space-y-2.5"
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
							className={cn(
								"rounded-xl border border-border/40 border-l-[3px] overflow-hidden transition-all duration-300",
								isMultiple
									? "border-l-emerald-400 bg-card shadow-md"
									: hasActivity
										? "border-l-amber-400 bg-card shadow-md"
										: "border-l-transparent bg-card/70 shadow-sm hover:shadow-md hover:bg-card/90",
							)}
						>
							<AccordionTrigger className="px-4 py-3.5 hover:no-underline">
								<div className="flex w-full items-center gap-3 pr-2">
									<div
										className={cn(
											"flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
											isMultiple
												? "bg-emerald-400/15 text-emerald-400"
												: hasActivity
													? "bg-amber-400/15 text-amber-400"
													: "bg-muted text-muted-foreground",
										)}
									>
										<Dumbbell className="size-[18px]" />
									</div>
									<span className="truncate font-display text-[15px] font-semibold tracking-tight">
										{muscleGroup.name}
									</span>
									{hasActivity && (
										<span
											className={cn(
												"ml-auto mr-2 inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums font-display transition-colors",
												isMultiple
													? "bg-emerald-400/15 text-emerald-400"
													: "bg-amber-400/15 text-amber-400",
											)}
										>
											<Check className="size-3" strokeWidth={3} />
											{activeCount}
										</span>
									)}
								</div>
							</AccordionTrigger>
							<AccordionContent className="px-4 pb-2">
								<div className="mb-2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
								<div>
									{muscleGroup.exercises.map((exercise) => (
										<ExerciseRow
											key={exercise._id}
											exercise={exercise}
											onToggleFinished={toggleFinished}
										/>
									))}
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
		<div className="flex flex-wrap gap-2.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]">
			{groups.map((group) => {
				const isActive = selectedIds.has(group._id);
				return (
					<button
						key={group._id}
						type="button"
						onClick={() => onToggle(group._id)}
						className={cn(
							"shrink-0 rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-200 active:scale-[0.97]",
							isActive
								? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
								: "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
						)}
					>
						{group.name}
					</button>
				);
			})}
		</div>
	);
}
