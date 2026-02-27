import { Skeleton } from "@/components/ui/skeleton";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import { Check, Dumbbell, Flame, HeartPulse } from "lucide-react";

export const Route = createFileRoute("/week")({
	component: RouteComponent,
});

function getWeekDays(): {
	name: string;
	shortName: string;
	date: Date;
	isToday: boolean;
	isPast: boolean;
}[] {
	const now = new Date();
	const dayOfWeek = now.getDay();
	// Monday = 0, Sunday = 6
	const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
	const monday = new Date(now);
	monday.setDate(now.getDate() + mondayOffset);
	monday.setHours(0, 0, 0, 0);

	const days = [];
	const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
	const fullNames = [
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
		"Sunday",
	];

	for (let i = 0; i < 7; i++) {
		const date = new Date(monday);
		date.setDate(monday.getDate() + i);

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		days.push({
			name: fullNames[i],
			shortName: dayNames[i],
			date,
			isToday: date.getTime() === today.getTime(),
			isPast: date.getTime() < today.getTime(),
		});
	}

	return days;
}

function getDayRange(date: Date): { start: number; end: number } {
	const dayStart = new Date(date);
	dayStart.setHours(0, 0, 0, 0);
	const dayEnd = new Date(date);
	dayEnd.setHours(23, 59, 59, 999);
	return { start: dayStart.getTime(), end: dayEnd.getTime() };
}

function hasCardioDoneOnDay(
	cardioEntries: { doneAt?: number }[],
	date: Date,
): boolean {
	const { start, end } = getDayRange(date);
	return cardioEntries.some(
		(entry) =>
			entry.doneAt !== undefined &&
			entry.doneAt >= start &&
			entry.doneAt <= end,
	);
}

function hasWorkoutOnDay(
	workouts: { startTime: number }[],
	activeWorkout: { startTime: number } | null | undefined,
	date: Date,
): boolean {
	const { start, end } = getDayRange(date);
	const inRange = (t: number) => t >= start && t <= end;

	if (workouts.some((w) => inRange(w.startTime))) return true;
	if (activeWorkout && inRange(activeWorkout.startTime)) return true;
	return false;
}

function RouteComponent() {
	const weekDays = getWeekDays();
	const cardioEntries = useQuery(api.cardio.get);
	const workouts = useQuery(api.workouts.getAll);
	const activeWorkout = useQuery(api.workouts.getCurrentWorkout);

	if (cardioEntries === undefined || workouts === undefined) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-8 w-40" />
				<div className="space-y-2">
					{[...Array(7)].map((_, i) => (
						<Skeleton key={i} className="h-16 w-full rounded-xl" />
					))}
				</div>
			</div>
		);
	}

	const activeDays = weekDays.filter((day) => {
		const c = hasCardioDoneOnDay(cardioEntries, day.date);
		const s = hasWorkoutOnDay(workouts, activeWorkout, day.date);
		return c || s;
	}).length;

	return (
		<div className="space-y-5">
			<div className="flex items-end justify-between">
				<h1 className="text-2xl font-bold tracking-tight">This Week</h1>
				{activeDays > 0 && (
					<span className="text-sm font-medium text-muted-foreground font-display">
						<span className="text-primary font-bold">{activeDays}</span>/7 days
					</span>
				)}
			</div>

			<div className="space-y-2">
				{weekDays.map((day, i) => {
					const cardio = hasCardioDoneOnDay(cardioEntries, day.date);
					const strength = hasWorkoutOnDay(workouts, activeWorkout, day.date);
					const hasActivity = strength || cardio;
					const hasBoth = strength && cardio;

					return (
						<div
							key={day.shortName}
							className="relative"
							style={{ animationDelay: `${i * 40}ms` }}
						>
							<div
								className={`
									relative overflow-hidden rounded-xl border transition-all duration-300
									${
										hasActivity
											? hasBoth
												? "border-primary/50 bg-gradient-to-r from-primary/10 via-card to-card shadow-md week-row-glow-both"
												: "border-primary/30 bg-gradient-to-r from-primary/8 via-card to-card shadow-sm week-row-glow"
											: day.isToday
												? "border-border bg-card shadow-sm"
												: day.isPast
													? "border-border/70 bg-card/70"
													: "border-border/60 bg-card/60"
									}
								`}
							>
								{/* Left accent bar */}
								<div
									className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-all duration-300 ${
										hasBoth
											? "bg-gradient-to-b from-primary via-primary/80 to-[oklch(0.7_0.18_20)]"
											: hasActivity
												? "bg-primary/80"
												: day.isToday
													? "bg-muted-foreground/40"
													: day.isPast
														? "bg-border"
														: "bg-border/70"
									}`}
								/>

								<div className="flex items-center gap-3 pl-4.5 pr-4 py-3">
									{/* Date column */}
									<div
										className={`flex flex-col items-center w-10 shrink-0 transition-all duration-300 ${
											hasActivity ? "scale-105" : ""
										}`}
									>
										<span
											className={`text-[10px] font-semibold uppercase tracking-widest ${
												hasActivity
													? "text-primary"
													: day.isToday
														? "text-muted-foreground"
														: "text-muted-foreground"
											}`}
										>
											{day.shortName}
										</span>
										<span
											className={`text-xl font-extrabold font-display leading-tight ${
												hasActivity
													? "text-foreground"
													: day.isToday
														? "text-foreground/80"
														: day.isPast
															? "text-muted-foreground"
															: "text-muted-foreground/80"
											}`}
										>
											{day.date.getDate()}
										</span>
									</div>

									{/* Divider */}
									<div
										className={`h-9 w-px shrink-0 transition-colors duration-300 ${
											hasActivity ? "bg-primary/20" : "bg-border/70"
										}`}
									/>

									{/* Content */}
									<div className="flex items-center gap-2 flex-1 min-w-0">
										{!hasActivity && (
											<span
												className={`text-sm ${
													day.isToday
														? "text-muted-foreground"
														: day.isPast
															? "text-muted-foreground/70 italic"
															: "text-muted-foreground/60"
												}`}
											>
												{day.isPast
													? "Rest day"
													: day.isToday
														? "No workout yet"
														: "\u2014"}
											</span>
										)}
										{strength && (
											<div className="flex items-center gap-1.5 rounded-lg bg-primary/15 px-2.5 py-1.5 border border-primary/20">
												<Dumbbell className="size-3.5 text-primary" />
												<span className="text-xs font-semibold text-primary font-display tracking-wide">
													Strength
												</span>
											</div>
										)}
										{cardio && (
											<div className="flex items-center gap-1.5 rounded-lg bg-[oklch(0.7_0.18_20_/_0.12)] px-2.5 py-1.5 border border-[oklch(0.7_0.18_20_/_0.2)]">
												<HeartPulse className="size-3.5 text-[oklch(0.75_0.16_20)]" />
												<span className="text-xs font-semibold text-[oklch(0.75_0.16_20)] font-display tracking-wide">
													Cardio
												</span>
											</div>
										)}
									</div>

									{/* Status indicator */}
									<div className="shrink-0">
										{hasBoth ? (
											<div className="flex size-7 items-center justify-center rounded-full bg-primary/20 border border-primary/30">
												<Flame className="size-3.5 text-primary" />
											</div>
										) : hasActivity ? (
											<div className="flex size-7 items-center justify-center rounded-full bg-primary/15 border border-primary/20">
												<Check
													className="size-3.5 text-primary"
													strokeWidth={2.5}
												/>
											</div>
										) : day.isToday ? (
											<div className="size-2.5 rounded-full bg-primary/50 animate-pulse-glow shrink-0" />
										) : null}
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
