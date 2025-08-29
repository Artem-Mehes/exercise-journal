import { Link } from "@tanstack/react-router";
import { Dumbbell, List, Plus, PlusCircle } from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";

const items = [
	{
		title: "Create Exercise",
		url: "/",
		icon: Plus,
	},
	{
		title: "Exercises",
		url: "/exercises",
		icon: List,
	},
	{
		title: "Create Workout",
		url: "/create-workout",
		icon: PlusCircle,
	},
	{
		title: "Workouts",
		url: "/workouts",
		icon: Dumbbell,
	},
];

export function AppSidebar() {
	const { toggleSidebar } = useSidebar();

	return (
		<Sidebar>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Exercise Journal</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										<Link to={item.url} onClick={toggleSidebar}>
											<item.icon />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
