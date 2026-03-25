import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
	ArrowLeft,
	Check,
	Circle,
	Clock,
	HeartPulse,
	Minus,
	Mountain,
	Search,
	Trash2,
	Zap,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/planner/$date")({
	component: PlannerPage,
});

function parseDate(dateStr: string): Date {
	const [y, m, d] = dateStr.split("-").map(Number);
	return new Date(y, m - 1, d);
}

function formatPageDate(date: Date): string {
	return date.toLocaleDateString("en-US", {
		weekday: "long",
		month: "short",
		day: "numeric",
	});
}

function PlannerPage() {
	const { date: dateStr } = Route.useParams();
	const date = parseDate(dateStr);

	const planned = useQuery(api.plannedExercises.getByDate, { date: dateStr });
	const plannedCardio = useQuery(api.plannedCardio.getByDate, {
		date: dateStr,
	});
	const currentWorkout = useQuery(api.workouts.getCurrentWorkout);
	const hasActiveWorkout = !!currentWorkout;
	const toggleFinished = useMutation(api.exercises.toggleFinished);
	const removePlanned = useMutation(api.plannedExercises.remove);
	const removePlannedCardio = useMutation(api.plannedCardio.remove);

	const plannedExerciseIds = new Set(
		(planned ?? []).map((p) => p.exerciseId as string),
	);
	const plannedCardioIds = new Set(
		(plannedCardio ?? []).map((p) => p.cardioId as string),
	);

	return (
		<div className="space-y-5">
			{/* Header */}
			<div className="flex items-center gap-3">
				<Link
					to="/week"
					className="flex size-8 items-center justify-center rounded-lg bg-muted/80 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
				>
					<ArrowLeft className="size-4" />
				</Link>
				<h1 className="text-2xl font-bold tracking-tight">
					{formatPageDate(date)}
				</h1>
			</div>

			{/* Planned exercises list */}
			<div className="space-y-1">
				{planned === undefined ? (
					<div className="space-y-2">
						{[...Array(3)].map((_, i) => (
							<Skeleton key={i} className="h-12 w-full rounded-lg" />
						))}
					</div>
				) : planned.length === 0 ? (
					<p className="text-sm text-muted-foreground py-6 text-center">
						No exercises planned yet
					</p>
				) : (
					planned.map((item) => (
						<div
							key={item._id}
							className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent/30"
						>
							<button
								type="button"
								disabled={!hasActiveWorkout}
								onClick={() =>
									toggleFinished({
										exerciseId: item.exerciseId as Id<"exercises">,
									})
								}
								className="shrink-0"
							>
								{item.isFinished ? (
									<div className="flex size-6 items-center justify-center rounded-full bg-primary/20 border border-primary/30">
										<Check
											className="size-3.5 text-primary"
											strokeWidth={2.5}
										/>
									</div>
								) : hasActiveWorkout ? (
									<Circle className="size-6 text-muted-foreground/50" />
								) : (
									<Minus className="size-6 text-muted-foreground/25" />
								)}
							</button>

							<Link
								to="/exercises/$exerciseId"
								params={{ exerciseId: item.exerciseId as string }}
								className={`flex-1 min-w-0 ${item.isFinished ? "opacity-50" : ""}`}
							>
								<div
									className={`text-sm font-medium truncate ${item.isFinished ? "line-through" : ""}`}
								>
									{item.exerciseName}
								</div>
								<div className="text-xs text-muted-foreground truncate">
									{item.groupName}
								</div>
							</Link>

							<button
								type="button"
								onClick={() =>
									removePlanned({
										plannedExerciseId: item._id as Id<"plannedExercises">,
									})
								}
								className="shrink-0 text-muted-foreground/40 hover:text-destructive transition-colors"
							>
								<Trash2 className="size-3.5" />
							</button>
						</div>
					))
				)}
			</div>

			{/* Divider */}
			{planned && planned.length > 0 && <div className="h-px bg-border/60" />}

			{/* Inline exercise picker */}
			<ExercisePicker
				dateStr={dateStr}
				plannedExerciseIds={plannedExerciseIds}
			/>

			{/* Cardio section divider */}
			<div className="h-px bg-border/60" />

			{/* Planned cardio list */}
			<div className="space-y-1">
				<h2 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
					<HeartPulse className="size-3.5" />
					Planned Cardio
				</h2>
				{plannedCardio === undefined ? (
					<div className="space-y-2">
						{[...Array(2)].map((_, i) => (
							<Skeleton key={i} className="h-12 w-full rounded-lg" />
						))}
					</div>
				) : plannedCardio.length === 0 ? (
					<p className="text-sm text-muted-foreground py-4 text-center">
						No cardio planned yet
					</p>
				) : (
					plannedCardio.map((item) => (
						<div
							key={item._id}
							className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent/30"
						>
							<HeartPulse className="size-4 text-[oklch(0.75_0.16_20)] shrink-0" />

							<div className="flex-1 min-w-0">
								<div className="text-sm font-medium truncate">
									{item.title}
								</div>
								<div className="flex items-center gap-3 text-xs text-muted-foreground">
									<span className="flex items-center gap-1">
										<Clock className="size-3" />
										{item.time}min
									</span>
									<span className="flex items-center gap-1">
										<Mountain className="size-3" />
										{item.incline}
									</span>
									<span className="flex items-center gap-1">
										<Zap className="size-3" />
										{item.speed}
									</span>
								</div>
							</div>

							<button
								type="button"
								onClick={() =>
									removePlannedCardio({
										plannedCardioId: item._id as Id<"plannedCardio">,
									})
								}
								className="shrink-0 text-muted-foreground/40 hover:text-destructive transition-colors"
							>
								<Trash2 className="size-3.5" />
							</button>
						</div>
					))
				)}
			</div>

			{/* Divider */}
			{plannedCardio && plannedCardio.length > 0 && (
				<div className="h-px bg-border/60" />
			)}

			{/* Cardio picker */}
			<CardioPicker dateStr={dateStr} plannedCardioIds={plannedCardioIds} />
		</div>
	);
}

function ExercisePicker({
	dateStr,
	plannedExerciseIds,
}: {
	dateStr: string;
	plannedExerciseIds: Set<string>;
}) {
	const [search, setSearch] = useState("");
	const groups = useQuery(api.exerciseGroups.getAllWithExercises);
	const addPlanned = useMutation(api.plannedExercises.add);

	if (!groups) return null;

	const allExercises = groups.flatMap((g) =>
		g.exercises.map((e) => ({
			id: e._id,
			name: e.name,
			groupName: g.name,
		})),
	);

	const filtered = search.trim()
		? allExercises.filter(
				(e) =>
					e.name.toLowerCase().includes(search.toLowerCase()) ||
					e.groupName.toLowerCase().includes(search.toLowerCase()),
			)
		: allExercises;

	return (
		<div className="space-y-2">
			<h2 className="text-sm font-medium text-muted-foreground">
				Add exercises
			</h2>

			<div className="relative">
				<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60 pointer-events-none" />
				<Input
					placeholder="Search exercises..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="pl-9 rounded-xl bg-card border-border/60 h-10"
				/>
			</div>

			<div className="space-y-0.5">
				{filtered.map((exercise) => {
					const isPlanned = plannedExerciseIds.has(exercise.id);

					return (
						<div
							key={exercise.id}
							className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
								isPlanned ? "opacity-40" : "hover:bg-accent active:bg-accent/80"
							}`}
						>
							<button
								type="button"
								disabled={isPlanned}
								onClick={() =>
									addPlanned({
										exerciseId: exercise.id as Id<"exercises">,
										date: dateStr,
									})
								}
								className="flex-1 min-w-0 text-left"
							>
								<div className="text-sm font-medium truncate">
									{exercise.name}
								</div>
								<div className="text-xs text-muted-foreground truncate">
									{exercise.groupName}
								</div>
							</button>
							<Link
								to="/exercises/$exerciseId"
								params={{ exerciseId: exercise.id as string }}
								className="shrink-0 text-muted-foreground/40 hover:text-foreground transition-colors"
								onClick={(e) => e.stopPropagation()}
							>
								<ArrowLeft className="size-3.5 rotate-180" />
							</Link>
							{isPlanned && <Check className="size-4 text-primary shrink-0" />}
						</div>
					);
				})}
				{filtered.length === 0 && (
					<p className="text-sm text-muted-foreground text-center py-4">
						No exercises found
					</p>
				)}
			</div>
		</div>
	);
}

function CardioPicker({
	dateStr,
	plannedCardioIds,
}: {
	dateStr: string;
	plannedCardioIds: Set<string>;
}) {
	const [search, setSearch] = useState("");
	const cardioEntries = useQuery(api.cardio.get);
	const addPlannedCardio = useMutation(api.plannedCardio.add);

	if (!cardioEntries) return null;

	const filtered = search.trim()
		? cardioEntries.filter((c) =>
				c.title.toLowerCase().includes(search.toLowerCase()),
			)
		: cardioEntries;

	return (
		<div className="space-y-2">
			<h2 className="text-sm font-medium text-muted-foreground">
				Add cardio
			</h2>

			<div className="relative">
				<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60 pointer-events-none" />
				<Input
					placeholder="Search cardio..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="pl-9 rounded-xl bg-card border-border/60 h-10"
				/>
			</div>

			<div className="space-y-0.5">
				{filtered.map((cardio) => {
					const isPlanned = plannedCardioIds.has(cardio._id);

					return (
						<button
							key={cardio._id}
							type="button"
							disabled={isPlanned}
							onClick={() =>
								addPlannedCardio({
									cardioId: cardio._id as Id<"cardio">,
									date: dateStr,
								})
							}
							className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
								isPlanned ? "opacity-40" : "hover:bg-accent active:bg-accent/80"
							}`}
						>
							<HeartPulse className="size-4 text-[oklch(0.75_0.16_20)] shrink-0" />
							<div className="flex-1 min-w-0">
								<div className="text-sm font-medium truncate">
									{cardio.title}
								</div>
								<div className="flex items-center gap-3 text-xs text-muted-foreground">
									<span className="flex items-center gap-1">
										<Clock className="size-3" />
										{cardio.time}min
									</span>
									<span className="flex items-center gap-1">
										<Mountain className="size-3" />
										{cardio.incline}
									</span>
									<span className="flex items-center gap-1">
										<Zap className="size-3" />
										{cardio.speed}
									</span>
								</div>
							</div>
							{isPlanned && <Check className="size-4 text-primary shrink-0" />}
						</button>
					);
				})}
				{filtered.length === 0 && (
					<p className="text-sm text-muted-foreground text-center py-4">
						No cardio entries found
					</p>
				)}
			</div>
		</div>
	);
}
