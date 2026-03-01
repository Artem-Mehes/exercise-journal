import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownUp } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/converter")({
	component: ConverterPage,
});

const LBS_PER_KG = 2.20462;

function ConverterPage() {
	const [kg, setKg] = useState("");
	const [lbs, setLbs] = useState("");

	const handleKgChange = (value: string) => {
		setKg(value);
		if (value === "" || value === ".") {
			setLbs("");
			return;
		}
		const num = Number.parseFloat(value);
		if (!Number.isNaN(num)) {
			setLbs((num * LBS_PER_KG).toFixed(1));
		}
	};

	const handleLbsChange = (value: string) => {
		setLbs(value);
		if (value === "" || value === ".") {
			setKg("");
			return;
		}
		const num = Number.parseFloat(value);
		if (!Number.isNaN(num)) {
			setKg((num / LBS_PER_KG).toFixed(1));
		}
	};

	const handleSwap = () => {
		const prevKg = kg;
		const prevLbs = lbs;
		setKg(prevLbs);
		handleKgChange(prevLbs);
	};

	return (
		<div className="flex flex-col items-center gap-6 pt-6">
			<h1 className="font-display text-xl font-semibold tracking-tight text-foreground">
				Weight Converter
			</h1>

			<div className="w-full max-w-sm space-y-3">
				{/* KG Field */}
				<div className="group relative rounded-xl border border-border/60 bg-card p-4 shadow-sm transition-colors focus-within:border-primary/40">
					<label
						htmlFor="kg-input"
						className="mb-2 block font-display text-xs font-medium uppercase tracking-widest text-muted-foreground"
					>
						Kilograms
					</label>
					<div className="flex items-baseline gap-2">
						<input
							id="kg-input"
							type="number"
							inputMode="decimal"
							step="any"
							placeholder="0"
							value={kg}
							onChange={(e) => handleKgChange(e.target.value)}
							onFocus={(e) => e.target.select()}
							className="w-full bg-transparent font-display text-3xl font-semibold tabular-nums text-foreground outline-none placeholder:text-muted-foreground/30 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
						/>
						<span className="shrink-0 font-display text-lg font-medium text-muted-foreground/50">
							kg
						</span>
					</div>
				</div>

				{/* Swap Button */}
				<div className="flex justify-center">
					<button
						type="button"
						onClick={handleSwap}
						className="group/swap flex size-10 items-center justify-center rounded-full border border-border/60 bg-card text-muted-foreground shadow-sm transition-all hover:border-primary/40 hover:text-primary active:scale-95"
					>
						<ArrowDownUp className="size-4 transition-transform duration-200 group-hover/swap:rotate-180" />
					</button>
				</div>

				{/* LBS Field */}
				<div className="group relative rounded-xl border border-border/60 bg-card p-4 shadow-sm transition-colors focus-within:border-primary/40">
					<label
						htmlFor="lbs-input"
						className="mb-2 block font-display text-xs font-medium uppercase tracking-widest text-muted-foreground"
					>
						Pounds
					</label>
					<div className="flex items-baseline gap-2">
						<input
							id="lbs-input"
							type="number"
							inputMode="decimal"
							step="any"
							placeholder="0"
							value={lbs}
							onChange={(e) => handleLbsChange(e.target.value)}
							onFocus={(e) => e.target.select()}
							className="w-full bg-transparent font-display text-3xl font-semibold tabular-nums text-foreground outline-none placeholder:text-muted-foreground/30 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
						/>
						<span className="shrink-0 font-display text-lg font-medium text-muted-foreground/50">
							lbs
						</span>
					</div>
				</div>
			</div>

			{/* Quick reference chips */}
			<div className="w-full max-w-sm space-y-2">
				<p className="font-display text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
					Common plates
				</p>
				<div className="flex flex-wrap gap-2">
					{[
						{ kg: 1.25, lbs: 2.8 },
						{ kg: 2.5, lbs: 5.5 },
						{ kg: 5, lbs: 11 },
						{ kg: 10, lbs: 22 },
						{ kg: 15, lbs: 33.1 },
						{ kg: 20, lbs: 44.1 },
						{ kg: 25, lbs: 55.1 },
					].map((plate) => (
						<button
							key={plate.kg}
							type="button"
							onClick={() => handleKgChange(String(plate.kg))}
							className="rounded-lg border border-border/60 bg-card px-3 py-1.5 font-display text-xs font-medium tabular-nums text-muted-foreground shadow-sm transition-all hover:border-primary/40 hover:text-primary active:scale-95"
						>
							{plate.kg}kg
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
