import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Weight conversion utilities
export function lbsToKg(lbs: number): number {
	return lbs * 0.453592;
}

export function kgToLbs(kg: number): number {
	return kg * 2.20462;
}

export function formatWeight(weightInKg: number): { kg: string; lbs: string } {
	return {
		kg: weightInKg.toFixed(1),
		lbs: kgToLbs(weightInKg).toFixed(1),
	};
}
