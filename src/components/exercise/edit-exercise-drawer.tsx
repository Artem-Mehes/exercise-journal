import toast from "@/integrations/toast";
import type { Id } from "convex/_generated/dataModel";
import { Pencil } from "lucide-react";
import { useState } from "react";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "../ui/drawer";
import { EditExerciseForm } from "./edit-exercise-form";

interface EditExerciseDrawerProps {
	exerciseId: Id<"exercises">;
}

export function EditExerciseDrawer({ exerciseId }: EditExerciseDrawerProps) {
	const [open, setOpen] = useState(false);

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerTrigger className="text-sm flex items-center gap-1">
				Edit
				<Pencil className="size-4" />
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Edit Exercise</DrawerTitle>
				</DrawerHeader>
				<div className="p-4 pb-6">
					<EditExerciseForm
						exerciseId={exerciseId}
						onSuccess={() => {
							setOpen(false);
							toast.success("Exercise updated successfully");
						}}
					/>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
