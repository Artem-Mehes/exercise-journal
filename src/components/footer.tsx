import { Link } from "@tanstack/react-router";
import {
	ArrowDownUp,
	BicepsFlexed,
	CalendarDays,
	Dumbbell,
	HeartPulse,
} from "lucide-react";

const items = [
	{
		title: "Exercises",
		url: "/",
		icon: Dumbbell,
	},
	{
		title: "Cardio",
		url: "/cardio",
		icon: HeartPulse,
	},
	{
		title: "Week",
		url: "/week",
		icon: CalendarDays,
	},
	{
		title: "Workouts",
		url: "/workouts",
		icon: BicepsFlexed,
	},
	{
		title: "Convert",
		url: "/converter",
		icon: ArrowDownUp,
	},
];

export function AppFooter() {
	return (
		<footer className="border-t border-border/60 bg-card/80 backdrop-blur-md w-full">
			<nav className="flex items-center justify-around px-2 py-1.5 pb-5 max-w-lg mx-auto">
				{items.map((item) => (
					<Link
						key={item.title}
						to={item.url}
						className="group relative flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all duration-200 text-muted-foreground data-[status=active]:text-primary"
					>
						<div className="relative">
							<item.icon className="size-5 transition-transform duration-200 group-hover:scale-110" />
						</div>
						<span className="text-[11px] font-medium font-display tracking-wide">
							{item.title}
						</span>
						<div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-0.5 w-0 rounded-full bg-primary transition-all duration-200 group-data-[status=active]:w-6" />
					</Link>
				))}
			</nav>
		</footer>
	);
}
