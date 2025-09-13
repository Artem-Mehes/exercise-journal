import { Button } from "@/components/ui/button";
import { useAppForm } from "@/hooks/form";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { z } from "zod";

const validationSchema = z.object({
	name: z.string().min(1, {
		message: "Name is required",
	}),
	groupId: z.string().min(1, {
		message: "Group is required",
	}),
	setsGoal: z.string(),
});

interface ExerciseFormProps {
	mode: "create" | "edit";
	exerciseId?: Id<"exercises">;
	onSuccess?: () => void;
}

export function ExerciseForm({
	mode,
	exerciseId,
	onSuccess,
}: ExerciseFormProps) {
	const groups = useQuery(api.exerciseGroups.get);
	const exercise = useQuery(
		api.exercises.getById,
		mode === "edit" && exerciseId ? { exerciseId } : "skip",
	);

	const createExercise = useMutation(api.exercises.create);
	const updateExercise = useMutation(api.exercises.update);

	const defaultValues = {
		name: mode === "edit" ? exercise?.name || "" : "",
		groupId: mode === "edit" ? exercise?.groupId || "" : "",
		setsGoal: mode === "edit" ? exercise?.setsGoal?.toString() || "" : "",
	};

	const form = useAppForm({
		defaultValues,
		validators: {
			onSubmit: validationSchema,
		},
		onSubmit: async ({ value, formApi }) => {
			if (mode === "create") {
				await createExercise({
					name: value.name.trim(),
					groupId: value.groupId as Id<"exerciseGroups">,
					setsGoal: Number(value.setsGoal),
				});

				formApi.reset();
			} else {
				if (!exerciseId) {
					throw new Error("Exercise ID is required for edit mode");
				}
				await updateExercise({
					exerciseId,
					name: value.name.trim(),
					groupId: value.groupId as Id<"exerciseGroups">,
					setsGoal: Number(value.setsGoal),
				});
			}
			onSuccess?.();
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-5"
		>
			<div className="space-y-3">
				<form.AppField name="name">
					{(field) => <field.TextField label="Name" />}
				</form.AppField>

				<div className="grid grid-cols-2 gap-4">
					<form.AppField name="groupId">
						{(field) => (
							<field.SelectField
								label="Group"
								values={
									groups?.map((group) => ({
										label: group.name,
										value: group._id,
									})) || []
								}
							/>
						)}
					</form.AppField>

					<form.AppField name="setsGoal">
						{(field) => (
							<field.TextField
								label="Sets Goal"
								type="number"
								inputMode="numeric"
							/>
						)}
					</form.AppField>
				</div>
			</div>

			<Button type="submit" className="w-full">
				{mode === "create" ? "Create" : "Update"}
			</Button>
		</form>
	);
}
