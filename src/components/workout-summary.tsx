import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { Activity, Target, TrendingUp } from "lucide-react";
import { api } from "../../convex/_generated/api";

export function WorkoutSummary() {
	const data = useQuery(api.workouts.getCurrentWorkoutExercises);

	if (!data || data.groups.length === 0) return null;

	const completedCount = data.groups.reduce(
		(sum, g) => sum + g.exercises.filter((e) => e.isFinished).length,
		0,
	);
	const progress =
		data.totalExercises > 0 ? completedCount / data.totalExercises : 0;

	return (
		<div className="relative overflow-hidden rounded-xl border border-border/40 bg-card shadow-md">
			{/* Progress bar */}
			<div className="h-[3px] w-full bg-muted/60">
				<div
					className={cn(
						"h-full transition-all duration-700 ease-out",
						"bg-emerald-400",
					)}
				/>
			</div>

			<div className="space-y-3 px-4 pt-3 pb-4">
				{/* Stats row */}
				<div className="grid grid-cols-3 gap-3">
					<StatCell
						icon={<Target className="size-3.5" />}
						value={String(completedCount)}
						label="exercises"
						accent={
							progress >= 1 ? "emerald" : completedCount > 0 ? "amber" : "muted"
						}
					/>
					<StatCell
						icon={<TrendingUp className="size-3.5" />}
						value={String(data.groups.length)}
						label={data.groups.length === 1 ? "group" : "groups"}
						accent={data.groups.length > 1 ? "primary" : "muted"}
					/>
				</div>

				{/* Muscle group tags */}
				<div className="flex flex-wrap gap-1.5">
					{data.groups.map((group) => {
						const groupFinished = group.exercises.every((e) => e.isFinished);
						const groupSets = group.exercises.reduce(
							(s, e) => s + e.setsCount,
							0,
						);
						const activeCount = group.exercises.filter(
							(e) => e.setsCount > 0 || e.isFinished,
						).length;

						return (
							<div
								key={group.id}
								className={cn(
									"flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
									groupFinished
										? "bg-emerald-400/10 text-emerald-400"
										: "bg-muted/60 text-muted-foreground",
								)}
							>
								<Activity className="size-3 opacity-60" />
								<span className="font-display tracking-tight">
									{group.groupName}
								</span>
								<span
									className={cn(
										"tabular-nums opacity-70",
										groupFinished
											? "text-emerald-400/70"
											: "text-muted-foreground/60",
									)}
								>
									{activeCount}ex
									{groupSets > 0 && ` · ${groupSets}s`}
								</span>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

function StatCell({
	icon,
	value,
	label,
	accent,
}: {
	icon: React.ReactNode;
	value: string;
	label: string;
	accent: "emerald" | "amber" | "primary" | "muted";
}) {
	return (
		<div className="flex items-center gap-2">
			<div
				className={cn(
					"flex size-7 shrink-0 items-center justify-center rounded-lg",
					accent === "emerald" && "bg-emerald-400/15 text-emerald-400",
					accent === "amber" && "bg-amber-400/15 text-amber-400",
					accent === "primary" && "bg-primary/15 text-primary",
					accent === "muted" && "bg-muted-foreground/10 text-muted-foreground",
				)}
			>
				{icon}
			</div>
			<div className="min-w-0">
				<div className="font-display text-sm font-bold tabular-nums leading-tight tracking-tight">
					{value}
				</div>
				<div className="text-[10px] leading-tight text-muted-foreground/60">
					{label}
				</div>
			</div>
		</div>
	);
}
