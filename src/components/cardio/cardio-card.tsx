import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Id } from "convex/_generated/dataModel";
import { Clock, Mountain, Pencil, Trash2, Zap } from "lucide-react";
import { CardioFormDrawer } from "./cardio-form-drawer";

interface CardioCardProps {
	cardio: {
		_id: Id<"cardio">;
		title: string;
		time: number;
		incline: number;
		speed: number;
	};
	onDelete: (cardioId: Id<"cardio">) => void;
}

export function CardioCard({ cardio, onDelete }: CardioCardProps) {
	return (
		<Card className="shadow-sm">
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center justify-between">
					<span className="text-base font-semibold">{cardio.title}</span>
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
							className="size-8 text-destructive"
							onClick={() => onDelete(cardio._id)}
						>
							<Trash2 className="size-4" />
						</Button>
					</div>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex items-center gap-4 text-sm text-muted-foreground">
					<span className="flex items-center gap-1">
						<Clock className="size-4 text-primary" />
						{cardio.time} min
					</span>
					<span className="flex items-center gap-1">
						<Mountain className="size-4 text-primary" />
						{cardio.incline}
					</span>
					<span className="flex items-center gap-1">
						<Zap className="size-4 text-primary" />
						{cardio.speed}
					</span>
				</div>
			</CardContent>
		</Card>
	);
}
