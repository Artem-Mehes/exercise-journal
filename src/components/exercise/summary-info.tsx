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
		<Card className="shadow-sm">
			<CardHeader className="pb-2">
				<div className="flex items-center gap-2">
					<div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10">
						<Trophy className="size-4 text-amber-500" />
					</div>
					<CardTitle className="text-base font-semibold">
						Personal Records
					</CardTitle>
				</div>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 gap-3">
					<div className="rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10 p-4 text-center">
						<div className="mb-1 flex items-center justify-center gap-1.5">
							<Medal className="size-4 text-primary" />
							<span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
								Best Set
							</span>
						</div>
						<div className="text-xl font-bold text-primary">
							{volumeBestSet.count} × {volumeBestSet.weight}{" "}
							<span className="text-base font-medium">
								{volumeBestSet.unit}
							</span>
						</div>
						<div className="mt-1 text-xs text-muted-foreground">
							{Math.round(
								volumeBestSet.unit === "kg"
									? kgToLbs(volumeBestSet.weight)
									: lbsToKg(volumeBestSet.weight),
							)}{" "}
							{volumeBestSet.unit === "kg" ? "lbs" : "kg"}
						</div>
					</div>

					<div className="rounded-lg border bg-gradient-to-br from-success/5 to-success/10 p-4 text-center">
						<div className="mb-1 flex items-center justify-center gap-1.5">
							<Trophy className="size-4 text-success" />
							<span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
								Max Weight
							</span>
						</div>
						<div className="text-xl font-bold text-success">
							{summary.maxWeight.value}{" "}
							<span className="text-base font-medium">
								{summary.maxWeight.unit}
							</span>
						</div>
						<div className="mt-1 text-xs text-muted-foreground">
							{Math.round(
								summary.maxWeight.unit === "kg"
									? kgToLbs(summary.maxWeight.value)
									: lbsToKg(summary.maxWeight.value),
							)}{" "}
							{summary.maxWeight.unit === "kg" ? "lbs" : "kg"}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
