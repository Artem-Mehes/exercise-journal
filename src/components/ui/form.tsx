import { useStore } from "@tanstack/react-form";
import type { ComponentProps } from "react";

import { useFieldContext, useFormContext } from "@/hooks/form-context";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function SubscribeButton({ label }: { label: string }) {
	const form = useFormContext();
	return (
		<form.Subscribe selector={(state) => state.isSubmitting}>
			{(isSubmitting) => (
				<Button type="submit" disabled={isSubmitting}>
					{label}
				</Button>
			)}
		</form.Subscribe>
	);
}

function ErrorMessages({
	errors,
}: {
	errors: Array<string | { message: string }>;
}) {
	return (
		<>
			{errors.map((error) => (
				<div
					key={typeof error === "string" ? error : error.message}
					className="text-red-500 mt-1 font-bold"
				>
					{typeof error === "string" ? error : error.message}
				</div>
			))}
		</>
	);
}

export function TextField({
	label,
	placeholder,
	type,
	...props
}: {
	label: string;
	placeholder?: string;
} & ComponentProps<typeof Input>) {
	const field = useFieldContext<string>();
	const errors = useStore(field.store, (state) => state.meta.errors);

	return (
		<div>
			<Label htmlFor={label} className="mb-2  font-bold">
				{label}
			</Label>
			<Input
				{...props}
				type={type}
				value={field.state.value}
				placeholder={placeholder}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
			/>
			{field.state.meta.isTouched && <ErrorMessages errors={errors} />}
		</div>
	);
}

export function RadioGroupField({
	label,
	options,
}: { label?: string; options: string[] }) {
	const field = useFieldContext<string>();
	const errors = useStore(field.store, (state) => state.meta.errors);

	return (
		<div>
			{label && (
				<Label htmlFor={label} className="mb-2 font-bold">
					{label}
				</Label>
			)}

			<RadioGroup
				onValueChange={(value) => field.handleChange(value)}
				value={field.state.value}
			>
				{options.map((option) => (
					<div key={option} className="flex items-center space-x-2">
						<RadioGroupItem value={option} id={option}>
							{option}
						</RadioGroupItem>

						<Label htmlFor={option}>{option}</Label>
					</div>
				))}
			</RadioGroup>
			{field.state.meta.isTouched && <ErrorMessages errors={errors} />}
		</div>
	);
}
