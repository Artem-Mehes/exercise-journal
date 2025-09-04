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
});

const defaultValues = {
	name: "",
	groupId: "",
};

export function CreateExerciseForm() {
	const groups = useQuery(api.exerciseGroups.get);

	const createExercise = useMutation(api.exercises.create);

	const form = useAppForm({
		defaultValues,
		validators: {
			onSubmit: validationSchema,
		},
		onSubmit: async ({ value }) => {
			await createExercise({
				name: value.name,
				groupId: value.groupId as Id<"exerciseGroups">,
			});
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
			<div className="grid grid-cols-2 gap-4">
				<form.AppField name="name">
					{(field) => <field.TextField label="Name" />}
				</form.AppField>

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
			</div>

			<Button variant="action" type="submit" className="w-full">
				Create
			</Button>
		</form>
	);
}
