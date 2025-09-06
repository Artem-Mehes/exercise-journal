import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BicepsFlexed, Dumbbell, Plus } from "lucide-react";
import { CreateExerciseForm } from "./create-exercise-form";
import { CreateGroupForm } from "./create-group-form";

export function CreateDrawer() {
	return (
		<Drawer>
			<DrawerTrigger className="flex items-center gap-1 border border-muted-foreground/60 rounded-md px-2 py-1">
				<span>Create</span>
				<Plus className="size-6" />
			</DrawerTrigger>
			<DrawerContent>
				<Tabs defaultValue="exercise" className="w-full">
					<DrawerHeader>
						<TabsList className="w-full">
							<TabsTrigger value="exercise">
								<Dumbbell />
								<span>Exercise</span>
							</TabsTrigger>
							<TabsTrigger value="group">
								<BicepsFlexed />
								<span>Group</span>
							</TabsTrigger>
						</TabsList>
					</DrawerHeader>

					<TabsContent value="exercise" className="p-4 pb-6">
						<CreateExerciseForm />
					</TabsContent>
					<TabsContent value="group" className="p-4 pb-6">
						<CreateGroupForm />
					</TabsContent>
				</Tabs>
			</DrawerContent>
		</Drawer>
	);
}
