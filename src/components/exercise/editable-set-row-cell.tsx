import { useDebounce } from "@/hooks/use-debounce";
import clsx from "clsx";
import { api } from "convex/_generated/api";
import type { Doc, Id } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
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

	const editSet = useMutation(api.exercises.updateSet);

	const debouncedValue = useDebounce(value, 1000);

	useEffect(() => {
		if (debouncedValue !== children.toString()) {
			if (debouncedValue === "") {
				return;
			}

			editSet({
				setId,
				[field]: Number(debouncedValue),
			}).then(() => {
				setShowSuccess(true);
				setTimeout(() => setShowSuccess(false), 1500);
			});
		}
	}, [debouncedValue, editSet, setId, field, children]);

	return (
		<TableCell className="font-bold relative">
			<Input
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
