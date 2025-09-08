import { useDebounce } from "@/hooks/use-debounce";
import clsx from "clsx";
import { api } from "convex/_generated/api";
import type { Doc, Id } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { CheckCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import { TableCell } from "../ui/table";

export function EditableSetRowCell({
	children,
	setId,
	field,
}: {
	children: string | number;
	setId: Id<"sets">;
	field: keyof Doc<"sets">;
}) {
	const [value, setValue] = useState(children.toString());
	const [showSuccess, setShowSuccess] = useState(false);
	const lastSavedValueRef = useRef(children.toString());

	const editSet = useMutation(api.sets.update);

	const debouncedValue = useDebounce(value, 1000);

	// Update local state when props change (external updates)
	useEffect(() => {
		const newValue = children.toString();
		if (newValue !== lastSavedValueRef.current) {
			setValue(newValue);
			lastSavedValueRef.current = newValue;
		}
	}, [children]);

	const childrenString = children.toString();

	// Handle debounced value changes for database updates
	useEffect(() => {
		// Only update if the debounced value is different from what we last saved
		// and it's different from the current prop value
		if (
			debouncedValue !== lastSavedValueRef.current &&
			debouncedValue !== childrenString &&
			debouncedValue !== "" &&
			Number(debouncedValue) > 0 &&
			!Number.isNaN(Number(debouncedValue))
		) {
			editSet({
				setId,
				[field]: Number(debouncedValue),
			})
				.then(() => {
					lastSavedValueRef.current = debouncedValue;
					setShowSuccess(true);
					setTimeout(() => setShowSuccess(false), 1500);
				})
				.catch((error) => {
					console.error("Failed to update set:", error);
					// Revert to last known good value on error
					setValue(lastSavedValueRef.current);
				});
		}
	}, [debouncedValue, editSet, setId, field, childrenString]);

	return (
		<TableCell className="font-bold relative">
			<Input
				type="number"
				inputMode="numeric"
				value={value}
				onChange={(e) => setValue(e.target.value)}
				onFocus={(e) => e.target.select()}
				className={clsx(
					"text-sm w-[50px]",
					showSuccess && "focus-visible:ring-success",
				)}
			/>
			{showSuccess && (
				<div className="absolute left-9 top-2 animate-in fade-in-0 zoom-in-95 duration-300 text-success">
					<CheckCircle size={14} />
				</div>
			)}
		</TableCell>
	);
}
