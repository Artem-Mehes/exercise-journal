import { kgToLbs, lbsToKg } from "@/lib/utils";
import { Route } from "@/routes/exercises_.$exerciseId";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Medal, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export function ExerciseSummaryInfo() {
	const { exerciseId } = Route.useParams();

	const summary = useQuery(api.exercises.getSummary, {
		exerciseId: exerciseId as Id<"exercises">,
	});

	if (summary === undefined) {
		return (
			<div className="rounded-xl border bg-card p-4 shadow-sm">
				<Skeleton className="mb-4 h-6 w-24" />
				<div className="grid grid-cols-2 gap-4">
					<Skeleton className="h-20" />
					<Skeleton className="h-20" />
				</div>
			</div>
		);
	}

	if (summary?.bestSet === null) {
		return null;
	}

	const volumeBestSet = summary.bestSet.byVolume;

	return (
		<Card className="shadow-sm overflow-hidden">
			<CardHeader className="pb-2">
				<div className="flex items-center gap-2">
					<div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10">
						<Trophy className="size-4 text-amber-500" />
					</div>
					<CardTitle className="font-display text-base font-semibold tracking-tight">
						Personal Records
					</CardTitle>
				</div>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 gap-3">
					<div className="relative rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 via-primary/8 to-primary/15 p-4 text-center overflow-hidden">
						<div className="relative">
							<div className="mb-2 flex items-center justify-center gap-1.5">
								<Medal className="size-4 text-primary" />
								<span className="font-display text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
									Best Set
								</span>
							</div>
							<div className="font-display text-2xl font-bold text-primary">
								{volumeBestSet.count} x {volumeBestSet.weight}{" "}
								<span className="text-sm font-semibold">
									{volumeBestSet.unit}
								</span>
							</div>
							<div className="mt-1.5 text-xs text-muted-foreground">
								{Math.round(
									volumeBestSet.unit === "kg"
										? kgToLbs(volumeBestSet.weight)
										: lbsToKg(volumeBestSet.weight),
								)}{" "}
								{volumeBestSet.unit === "kg" ? "lbs" : "kg"}
							</div>
						</div>
					</div>

					<div className="relative rounded-lg border border-success/20 bg-gradient-to-br from-success/5 via-success/8 to-success/15 p-4 text-center overflow-hidden">
						<div className="relative">
							<div className="mb-2 flex items-center justify-center gap-1.5">
								<Trophy className="size-4 text-success" />
								<span className="font-display text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
									Max Weight
								</span>
							</div>
							<div className="font-display text-2xl font-bold text-success">
								{summary.maxWeight.value}{" "}
								<span className="text-sm font-semibold">
									{summary.maxWeight.unit}
								</span>
							</div>
							<div className="mt-1.5 text-xs text-muted-foreground">
								{Math.round(
									summary.maxWeight.unit === "kg"
										? kgToLbs(summary.maxWeight.value)
										: lbsToKg(summary.maxWeight.value),
								)}{" "}
								{summary.maxWeight.unit === "kg" ? "lbs" : "kg"}
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
