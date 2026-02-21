import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Medal, Pencil, Trash2, Trophy } from "lucide-react";
import { TemplateFormDrawer } from "./template-form-drawer";

interface ExerciseDetail {
	_id: Id<"exercises">;
	name: string;
	muscleGroup: string | null;
}

interface TemplateCardProps {
	template: {
		_id: Id<"templates">;
		name?: string;
		exercises: Id<"exercises">[];
		exerciseDetails: ExerciseDetail[];
	};
	onDelete: (templateId: Id<"templates">) => void;
}

function ExerciseStats({ exerciseId }: { exerciseId: Id<"exercises"> }) {
	const summary = useQuery(api.exercises.getSummary, { exerciseId });

	if (summary === undefined || summary.bestSet === null) {
		return null;
	}

	const bestSet = summary.bestSet.byVolume;

	return (
		<div className="flex items-center gap-3 text-xs text-muted-foreground">
			<span className="flex items-center gap-1">
				<Medal className="size-3 text-primary" />
				{bestSet.count} × {bestSet.weight} {bestSet.unit}
			</span>
			<span className="flex items-center gap-1">
				<Trophy className="size-3 text-success" />
				{summary.maxWeight.value} {summary.maxWeight.unit}
			</span>
		</div>
	);
}

export function TemplateCard({ template, onDelete }: TemplateCardProps) {
	return (
		<Card className="shadow-sm">
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<span className="text-base font-semibold">
							{template.name || "Untitled"}
						</span>
						<Badge variant="secondary" className="tabular-nums">
							{template.exerciseDetails.length}
						</Badge>
					</div>
					<div className="flex items-center gap-1">
						<TemplateFormDrawer
							mode="edit"
							templateId={template._id}
							trigger={
								<Button variant="ghost" size="icon" className="size-8">
									<Pencil className="size-4" />
								</Button>
							}
						/>
						<Button
							variant="ghost"
							size="icon"
							className="size-8 text-destructive"
							onClick={() => onDelete(template._id)}
						>
							<Trash2 className="size-4" />
						</Button>
					</div>
				</CardTitle>
			</CardHeader>
			<CardContent>
				{template.exerciseDetails.length === 0 ? (
					<p className="text-sm text-muted-foreground">No exercises added.</p>
				) : (
					<div className="space-y-2">
						{template.exerciseDetails.map((exercise, index) => (
							<div
								key={exercise._id}
								className="flex items-center justify-between rounded-md border bg-background p-2"
							>
								<div className="flex items-center gap-2">
									<span className="flex size-5 items-center justify-center rounded bg-muted text-xs font-medium text-muted-foreground">
										{index + 1}
									</span>
									<div>
										<span className="text-sm font-medium">{exercise.name}</span>
										{exercise.muscleGroup && (
											<span className="ml-2 text-xs text-muted-foreground">
												{exercise.muscleGroup}
											</span>
										)}
									</div>
								</div>
								<ExerciseStats exerciseId={exercise._id} />
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
