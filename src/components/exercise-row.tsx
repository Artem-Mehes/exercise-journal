import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import type { Doc, Id } from "convex/_generated/dataModel";
import { Check, ChevronRight, Flame } from "lucide-react";

type Exercise = Doc<"exercises"> & {
	isFinished?: boolean;
	currentSetsCount?: number;
};

interface ExerciseRowProps {
	exercise: Exercise;
	onToggleFinished: (args: { exerciseId: Id<"exercises"> }) => void;
}

export function ExerciseRow({ exercise, onToggleFinished }: ExerciseRowProps) {
	const currentSets =
		"currentSetsCount" in exercise ? (exercise.currentSetsCount as number) : 0;
	const isActive = currentSets > 0;
	const isFinished = "isFinished" in exercise && exercise.isFinished;
	const hasWorkout = "isFinished" in exercise;

	const rowClassName = cn(
		"group flex items-center rounded-lg px-3 py-2 transition-all duration-200",
		"hover:bg-accent/40 active:scale-[0.99]",
		isFinished ? "opacity-55" : isActive ? "bg-primary/[0.04]" : "",
	);

	const statusIcon = isFinished ? (
		<div className="flex size-5 items-center justify-center rounded-full bg-emerald-500/20">
			<Check className="size-3 text-emerald-400" strokeWidth={3} />
		</div>
	) : isActive ? (
		<div className="flex size-5 items-center justify-center rounded-full bg-amber-400/20">
			<Flame className="size-3 text-amber-400" />
		</div>
	) : (
		<div className="size-5 rounded-full border-2 border-border/60 transition-colors group-hover:border-primary/40" />
	);

	const exerciseName = (
		<div className="min-w-0 flex-1">
			<span
				className={cn(
					"block truncate text-base",
					isFinished
						? "text-muted-foreground line-through"
						: "text-foreground group-hover:text-primary",
				)}
			>
				{exercise.name}
			</span>
		</div>
	);

	const setsCount = isActive && (
		<span
			className={cn(
				"rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
				isFinished
					? "bg-emerald-500/10 text-emerald-400/60"
					: "bg-primary/10 text-primary",
			)}
		>
			{currentSets}
		</span>
	);

	const navIndicator = (
		<div
			className={cn(
				"flex size-7 items-center justify-center rounded-lg transition-all duration-200",
				isFinished
					? "bg-muted/30 text-muted-foreground/30"
					: "bg-muted/90 text-muted-foreground/90 group-hover:bg-primary/15 group-hover:text-primary",
			)}
		>
			<ChevronRight className="size-3.5" />
		</div>
	);

	if (hasWorkout) {
		return (
			<div className={rowClassName}>
				<button
					type="button"
					className="flex min-w-0 flex-1 items-center text-left"
					onClick={() => onToggleFinished({ exerciseId: exercise._id })}
				>
					<div
						className="grid transition-all duration-300 ease-out"
						style={{
							gridTemplateColumns: "24px",
							marginRight: "12px",
						}}
					>
						<div className="overflow-hidden flex">
							<div className="shrink-0 -my-0.5 rounded-full p-0.5">
								{statusIcon}
							</div>
						</div>
					</div>
					{exerciseName}
				</button>
				<div className="ml-3 flex shrink-0 items-center gap-2">
					{setsCount}
					<Link
						to="/exercises/$exerciseId"
						params={{ exerciseId: exercise._id }}
					>
						{navIndicator}
					</Link>
				</div>
			</div>
		);
	}

	return (
		<Link
			to="/exercises/$exerciseId"
			params={{ exerciseId: exercise._id }}
			className={rowClassName}
		>
			{exerciseName}
			<div className="ml-3 flex shrink-0 items-center gap-2">
				{setsCount}
				{navIndicator}
			</div>
		</Link>
	);
}
