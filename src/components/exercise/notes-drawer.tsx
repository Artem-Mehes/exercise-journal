import { useDebounce } from "@/hooks/use-debounce";
import toast from "@/integrations/toast";
import { Route } from "@/routes/exercises_.$exerciseId";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Check, Loader2, Notebook } from "lucide-react";
import { useEffect, useState } from "react";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "../ui/drawer";
import { Textarea } from "../ui/textarea";

export function NotesDrawer() {
	const { exerciseId } = Route.useParams();

	const exercise = useQuery(api.exercises.getById, {
		exerciseId: exerciseId as Id<"exercises">,
	});

	const updateNotes = useMutation(api.exercises.updateNotes);

	const [notes, setNotes] = useState<string>("");
	const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
		"idle",
	);

	const debouncedNotes = useDebounce(notes, 1000);

	useEffect(() => {
		if (exercise?.notes !== undefined) {
			setNotes(exercise.notes || "");
		}
	}, [exercise?.notes]);

	useEffect(() => {
		if (debouncedNotes !== (exercise?.notes || "")) {
			setSaveStatus("saving");

			updateNotes({
				exerciseId: exerciseId as Id<"exercises">,
				notes: debouncedNotes,
			})
				.then(() => {
					setTimeout(() => {
						setSaveStatus("saved");

						setTimeout(() => setSaveStatus("idle"), 2000);
					}, 500);
				})
				.catch(() => {
					toast.error("Failed to save notes");
				});
		}
	}, [debouncedNotes, exercise?.notes, updateNotes, exerciseId]);

	return (
		<Drawer>
			<DrawerTrigger className="flex items-center gap-1">
				<span className="text-sm">Notes</span>
				<Notebook className="size-4" />
			</DrawerTrigger>

			<DrawerContent>
				<DrawerHeader className="m-auto relative">
					<DrawerTitle>Exercise Notes</DrawerTitle>

					<div className="absolute -right-5">
						{saveStatus === "saving" && (
							<Loader2 className="size-5 animate-spin text-muted-foreground" />
						)}
						{saveStatus === "saved" && (
							<Check className="size-5 text-success" />
						)}
					</div>
				</DrawerHeader>

				<Textarea
					className="min-h-50 bg-transparent border-none resize-none focus-visible:ring-0"
					placeholder="Add notes for this exercise"
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
				/>
			</DrawerContent>
		</Drawer>
	);
}
