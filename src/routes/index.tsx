import { ExercisesList } from "@/components/exercises-list";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, createFileRoute } from "@tanstack/react-router";
import { BicepsFlexed, Dumbbell, PlusSquare } from "lucide-react";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<div className="flex items-center justify-between gap-4">
				<h1 className="text-2xl font-bold ">Exercises</h1>

				<DropdownMenu>
					<DropdownMenuTrigger>
						<PlusSquare />
					</DropdownMenuTrigger>
					<DropdownMenuContent className="mt-1 mr-2">
						<DropdownMenuItem>
							<Link to="/" className="flex items-center gap-2">
								<Dumbbell className="text-current" />
								<span>Create exercise</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem>
							<Link to="/" className="flex items-center gap-2">
								<BicepsFlexed className="text-current" />
								<span>Create muscle group</span>
							</Link>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<ExercisesList />
		</div>
	);
}
