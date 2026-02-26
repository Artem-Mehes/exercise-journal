import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Id } from "convex/_generated/dataModel";
import { Check, Clock, Mountain, Pencil, Trash2, Zap } from "lucide-react";
import { CardioFormDrawer } from "./cardio-form-drawer";

function isDoneToday(doneAt?: number): boolean {
	if (doneAt === undefined) return false;
	const todayStart = new Date();
	todayStart.setHours(0, 0, 0, 0);
	return doneAt >= todayStart.getTime();
}

interface CardioCardProps {
	cardio: {
		_id: Id<"cardio">;
		title: string;
		time: number;
		incline: number;
		speed: number;
		doneAt?: number;
	};
	onDelete: (cardioId: Id<"cardio">) => void;
	onToggleDone: (cardioId: Id<"cardio">) => void;
}

export function CardioCard({ cardio, onDelete, onToggleDone }: CardioCardProps) {
	const done = isDoneToday(cardio.doneAt);

	return (
		<Card className={`shadow-sm transition-colors ${done ? "border-success/40 bg-success/5" : ""}`}>
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2.5">
						<button
							type="button"
							onClick={() => onToggleDone(cardio._id)}
							className={`flex size-7 shrink-0 items-center justify-center rounded-lg border-2 transition-all ${
								done
									? "border-success bg-success text-white"
									: "border-muted-foreground/30 hover:border-muted-foreground/50"
							}`}
						>
							{done && <Check className="size-4" strokeWidth={3} />}
						</button>
						<span className={`font-display text-base font-semibold tracking-tight ${done ? "text-success" : ""}`}>
							{cardio.title}
						</span>
					</div>
					<div className="flex items-center gap-1">
						<CardioFormDrawer
							mode="edit"
							cardioId={cardio._id}
							trigger={
								<Button variant="ghost" size="icon" className="size-8">
									<Pencil className="size-4" />
								</Button>
							}
						/>
						<Button
							variant="ghost"
							size="icon"
							className="size-8 text-destructive hover:text-destructive"
							onClick={() => onDelete(cardio._id)}
						>
							<Trash2 className="size-4" />
						</Button>
					</div>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex items-center gap-5 text-sm">
					<div className="flex items-center gap-1.5">
						<div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
							<Clock className="size-3.5 text-primary" />
						</div>
						<span className="font-display font-medium tabular-nums">
							{cardio.time}
						</span>
						<span className="text-muted-foreground text-xs">min</span>
					</div>
					<div className="flex items-center gap-1.5">
						<div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
							<Mountain className="size-3.5 text-primary" />
						</div>
						<span className="font-display font-medium tabular-nums">
							{cardio.incline}
						</span>
					</div>
					<div className="flex items-center gap-1.5">
						<div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
							<Zap className="size-3.5 text-primary" />
						</div>
						<span className="font-display font-medium tabular-nums">
							{cardio.speed}
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
