import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import toast from "@/integrations/toast";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { type ReactNode, useEffect, useState } from "react";
import { ExercisePicker } from "./exercise-picker";
import {
	type SortableExercise,
	SortableExerciseList,
} from "./sortable-exercise-list";

interface TemplateFormDrawerProps {
	mode: "create" | "edit";
	templateId?: Id<"templates">;
	trigger: ReactNode;
}

export function TemplateFormDrawer({
	mode,
	templateId,
	trigger,
}: TemplateFormDrawerProps) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [exercises, setExercises] = useState<SortableExercise[]>([]);

	const template = useQuery(
		api.templates.getById,
		mode === "edit" && templateId ? { templateId } : "skip",
	);

	const createTemplate = useMutation(api.templates.create);
	const updateTemplate = useMutation(api.templates.update);

	useEffect(() => {
		if (mode === "edit" && template && open) {
			setName(template.name ?? "");
			setExercises(
				template.exerciseDetails.map((e) => ({
					_id: e._id,
					name: e.name,
				})),
			);
		}
	}, [template, mode, open]);

	function handleOpen(isOpen: boolean) {
		setOpen(isOpen);
		if (!isOpen) {
			return;
		}
		if (mode === "create") {
			setName("");
			setExercises([]);
		}
	}

	function handleToggleExercise(
		exerciseId: Id<"exercises">,
		exerciseName: string,
	) {
		setExercises((prev) => {
			const exists = prev.find((e) => e._id === exerciseId);
			if (exists) {
				return prev.filter((e) => e._id !== exerciseId);
			}
			return [...prev, { _id: exerciseId, name: exerciseName }];
		});
	}

	function handleRemoveExercise(exerciseId: Id<"exercises">) {
		setExercises((prev) => prev.filter((e) => e._id !== exerciseId));
	}

	async function handleSave() {
		const trimmedName = name.trim();
		if (!trimmedName) {
			toast.error("Template name is required");
			return;
		}

		if (mode === "create") {
			await createTemplate({
				name: trimmedName,
				exercises: exercises.map((e) => e._id),
			});
			toast.success("Template created");
		} else if (templateId) {
			await updateTemplate({
				templateId,
				name: trimmedName,
				exercises: exercises.map((e) => e._id),
			});
			toast.success("Template updated");
		}

		setOpen(false);
	}

	return (
		<Drawer open={open} onOpenChange={handleOpen}>
			<DrawerTrigger asChild>{trigger}</DrawerTrigger>
			<DrawerContent className="max-h-[85vh]">
				<DrawerHeader>
					<DrawerTitle>
						{mode === "create" ? "Create Template" : "Edit Template"}
					</DrawerTitle>
				</DrawerHeader>
				<div className="flex flex-col gap-4 overflow-y-auto p-4 pb-6">
					<div className="space-y-2">
						<Label htmlFor="template-name">Name</Label>
						<Input
							id="template-name"
							placeholder="e.g. Push Day, Leg Day..."
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</div>

					<Separator />

					<div className="space-y-2">
						<Label>Exercises ({exercises.length})</Label>
						<SortableExerciseList
							exercises={exercises}
							onReorder={setExercises}
							onRemove={handleRemoveExercise}
						/>
					</div>

					<Separator />

					<div className="space-y-2">
						<Label>Add Exercises</Label>
						<ExercisePicker
							selectedExerciseIds={exercises.map((e) => e._id)}
							onToggleExercise={handleToggleExercise}
						/>
					</div>

					<Button onClick={handleSave} className="w-full">
						{mode === "create" ? "Create Template" : "Save Changes"}
					</Button>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
