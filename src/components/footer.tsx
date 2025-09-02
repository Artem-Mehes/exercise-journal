import { Link } from "@tanstack/react-router";
import { File, List } from "lucide-react";

const items = [
	{
		title: "Exercises",
		url: "/",
		icon: List,
	},
	{
		title: "Templates",
		url: "/templates",
		icon: File,
	},
];

export function AppFooter() {
	return (
		<footer className="bg-accent border-t flex p-1 w-full">
			<div className="m-auto flex gap-10">
				{items.map((item) => (
					<Link
						key={item.title}
						to={item.url}
						className="flex flex-col items-center justify-center text-gray-400 data-[status=active]:text-primary gap-1"
					>
						<item.icon className="size-4" />
						<span className="text-sm">{item.title}</span>
					</Link>
				))}
			</div>
		</footer>
	);
}
