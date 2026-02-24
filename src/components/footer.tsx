import { Link } from "@tanstack/react-router";
import {
	BicepsFlexed,
	Dumbbell,
	HeartPulse,
	LayoutTemplate,
} from "lucide-react";

const items = [
	{
		title: "Exercises",
		url: "/",
		icon: Dumbbell,
	},
	{
		title: "Templates",
		url: "/templates",
		icon: LayoutTemplate,
	},
	{
		title: "Cardio",
		url: "/cardio",
		icon: HeartPulse,
	},
	{
		title: "Workouts",
		url: "/workouts",
		icon: BicepsFlexed,
	},
];

export function AppFooter() {
	return (
		<footer className="bg-secondary border-t flex p-1 pb-4 w-full">
			<div className="m-auto flex gap-10">
				{items.map((item) => (
					<Link
						key={item.title}
						to={item.url}
						className="flex flex-col items-center justify-center text-gray-500 data-[status=active]:text-primary gap-1"
					>
						<item.icon className="size-4" />
						<span className="text-sm">{item.title}</span>
					</Link>
				))}
			</div>
		</footer>
	);
}
