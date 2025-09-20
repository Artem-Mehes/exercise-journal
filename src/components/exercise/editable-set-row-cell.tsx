import { useDebounce } from "@/hooks/use-debounce";
import clsx from "clsx";
import { api } from "convex/_generated/api";
import type { Doc, Id } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { type ComponentProps, useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import { TableCell } from "../ui/table";

interface EditableSetRowCellProps extends ComponentProps<"div"> {
	setId: Id<"sets">;
	field: keyof Doc<"sets">;
	countValue: number;
}

export function EditableSetRowCell({
	children,
	setId,
	field,
	className,
	countValue,
}: EditableSetRowCellProps) {
	const [value, setValue] = useState(countValue.toString());
	const lastSavedValueRef = useRef(countValue.toString());

	const editSet = useMutation(api.sets.update);

	const debouncedValue = useDebounce(value, 1000);

	// Update local state when props change (external updates)
	useEffect(() => {
		const newValue = countValue.toString();
		if (newValue !== lastSavedValueRef.current) {
			setValue(newValue);
			lastSavedValueRef.current = newValue;
		}
	}, [countValue]);

	const childrenString = countValue.toString();

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
				})
				.catch((error) => {
					console.error("Failed to update set:", error);
					// Revert to last known good value on error
					setValue(lastSavedValueRef.current);
				});
		}
	}, [debouncedValue, editSet, setId, field, childrenString]);

	return (
		<TableCell className={clsx("font-bold flex", className)}>
			<Input
				type="number"
				inputMode="decimal"
				value={value}
				onChange={(e) => setValue(e.target.value)}
				onFocus={(e) => e.target.select()}
				className="text-sm w-[50px]"
			/>

			{children}
		</TableCell>
	);
}
