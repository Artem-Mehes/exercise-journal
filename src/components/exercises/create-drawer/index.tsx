import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BicepsFlexed, Dumbbell, PlusSquare } from "lucide-react";
import { CreateExerciseForm } from "./create-exercise-form";
import { CreateGroupForm } from "./create-group-form";

export function CreateDrawer() {
	return (
		<Drawer>
			<DrawerTrigger>
				<PlusSquare className="size-6" />
			</DrawerTrigger>
			<DrawerContent>
				<Tabs defaultValue="exercise" className="w-full">
					<DrawerHeader>
						<TabsList className="w-full">
							<TabsTrigger value="exercise">
								<Dumbbell />
								<span>Add Exercise</span>
							</TabsTrigger>
							<TabsTrigger value="group">
								<BicepsFlexed />
								<span>Add Group</span>
							</TabsTrigger>
						</TabsList>
					</DrawerHeader>

					<TabsContent value="exercise" className="p-4">
						<CreateExerciseForm />
					</TabsContent>
					<TabsContent value="group" className="p-4">
						<CreateGroupForm />
					</TabsContent>
				</Tabs>
			</DrawerContent>
		</Drawer>
	);
}
