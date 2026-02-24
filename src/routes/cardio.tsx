import { CardioCard } from "@/components/cardio/cardio-card";
import { CardioFormDrawer } from "@/components/cardio/cardio-form-drawer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "@/integrations/toast";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/cardio")({
	component: RouteComponent,
});

function RouteComponent() {
	const cardioEntries = useQuery(api.cardio.get);
	const removeCardio = useMutation(api.cardio.remove);

	async function handleDelete(cardioId: Id<"cardio">) {
		await removeCardio({ cardioId });
		toast.success("Cardio deleted");
	}

	if (cardioEntries === undefined) {
		return (
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<Skeleton className="h-8 w-40" />
					<Skeleton className="h-9 w-24" />
				</div>
				{[...Array(3)].map((_, i) => (
					<Skeleton key={i} className="h-24 w-full rounded-xl" />
				))}
			</div>
		);
	}

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Cardio</h1>
				<CardioFormDrawer
					mode="create"
					trigger={
						<Button variant="outline" size="sm">
							<Plus className="size-4" />
							Add
						</Button>
					}
				/>
			</div>

			{cardioEntries.length === 0 ? (
				<div className="py-12 text-center text-muted-foreground">
					No cardio entries yet. Add one to get started.
				</div>
			) : (
				<div className="space-y-3">
					{cardioEntries.map((entry) => (
						<CardioCard
							key={entry._id}
							cardio={entry}
							onDelete={handleDelete}
						/>
					))}
				</div>
			)}
		</div>
	);
}
