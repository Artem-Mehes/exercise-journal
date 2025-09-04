import { Button } from "@/components/ui/button";
import { useAppForm } from "@/hooks/form";
import { api } from "convex/_generated/api";
import { useMutation } from "convex/react";
import { z } from "zod";

const validationSchema = z.object({
	name: z.string().min(1, {
		message: "Name is required",
	}),
});

const defaultValues = {
	name: "",
};

export function CreateGroupForm() {
	const createGroup = useMutation(api.exerciseGroups.create);

	const form = useAppForm({
		defaultValues,
		validators: {
			onSubmit: validationSchema,
		},
		onSubmit: async ({ value }) => {
			await createGroup({
				name: value.name,
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
			<form.AppField name="name">
				{(field) => <field.TextField label="Name" />}
			</form.AppField>

			<Button variant="action" type="submit" className="w-full">
				Create
			</Button>
		</form>
	);
}
