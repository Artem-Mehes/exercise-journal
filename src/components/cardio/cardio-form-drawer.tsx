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
import toast from "@/integrations/toast";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { type ReactNode, useEffect, useState } from "react";

interface CardioFormDrawerProps {
	mode: "create" | "edit";
	cardioId?: Id<"cardio">;
	trigger: ReactNode;
}

export function CardioFormDrawer({
	mode,
	cardioId,
	trigger,
}: CardioFormDrawerProps) {
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [time, setTime] = useState("");
	const [incline, setIncline] = useState("");
	const [speed, setSpeed] = useState("");

	const cardio = useQuery(
		api.cardio.get,
		mode === "edit" && cardioId ? undefined : "skip",
	);

	const existingEntry =
		mode === "edit" && cardioId && cardio
			? cardio.find((c) => c._id === cardioId)
			: undefined;

	const createCardio = useMutation(api.cardio.create);
	const updateCardio = useMutation(api.cardio.update);

	useEffect(() => {
		if (mode === "edit" && existingEntry && open) {
			setTitle(existingEntry.title);
			setTime(String(existingEntry.time));
			setIncline(String(existingEntry.incline));
			setSpeed(String(existingEntry.speed));
		}
	}, [existingEntry, mode, open]);

	function handleOpen(isOpen: boolean) {
		setOpen(isOpen);
		if (!isOpen) return;
		if (mode === "create") {
			setTitle("");
			setTime("");
			setIncline("");
			setSpeed("");
		}
	}

	async function handleSave() {
		const trimmedTitle = title.trim();
		if (!trimmedTitle) {
			toast.error("Title is required");
			return;
		}

		const timeNum = Number(time);
		const inclineNum = Number(incline);
		const speedNum = Number(speed);

		if (Number.isNaN(timeNum) || timeNum < 0) {
			toast.error("Time must be a valid number");
			return;
		}
		if (Number.isNaN(inclineNum) || inclineNum < 0) {
			toast.error("Incline must be a valid number");
			return;
		}
		if (Number.isNaN(speedNum) || speedNum < 0) {
			toast.error("Speed must be a valid number");
			return;
		}

		if (mode === "create") {
			await createCardio({
				title: trimmedTitle,
				time: timeNum,
				incline: inclineNum,
				speed: speedNum,
			});
			toast.success("Cardio added");
		} else if (cardioId) {
			await updateCardio({
				cardioId,
				title: trimmedTitle,
				time: timeNum,
				incline: inclineNum,
				speed: speedNum,
			});
			toast.success("Cardio updated");
		}

		setOpen(false);
	}

	return (
		<Drawer open={open} onOpenChange={handleOpen}>
			<DrawerTrigger asChild>{trigger}</DrawerTrigger>
			<DrawerContent className="max-h-[85vh]">
				<DrawerHeader>
					<DrawerTitle>
						{mode === "create" ? "Add Cardio" : "Edit Cardio"}
					</DrawerTitle>
				</DrawerHeader>
				<div className="flex flex-col gap-4 overflow-y-auto p-4 pb-6">
					<div className="space-y-2">
						<Label htmlFor="cardio-title">Title</Label>
						<Input
							id="cardio-title"
							placeholder="e.g. Treadmill, Bike, Elliptical..."
							value={title}
							onChange={(e) => setTitle(e.target.value)}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="cardio-time">Time (minutes)</Label>
						<Input
							id="cardio-time"
							type="number"
							min="0"
							step="1"
							placeholder="30"
							value={time}
							onChange={(e) => setTime(e.target.value)}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="cardio-incline">Incline</Label>
						<Input
							id="cardio-incline"
							type="number"
							min="0"
							step="0.5"
							placeholder="5"
							value={incline}
							onChange={(e) => setIncline(e.target.value)}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="cardio-speed">Speed</Label>
						<Input
							id="cardio-speed"
							type="number"
							min="0"
							step="0.1"
							placeholder="8.5"
							value={speed}
							onChange={(e) => setSpeed(e.target.value)}
						/>
					</div>

					<Button onClick={handleSave} className="w-full">
						{mode === "create" ? "Add Cardio" : "Save Changes"}
					</Button>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
