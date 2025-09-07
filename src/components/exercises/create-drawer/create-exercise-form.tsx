import { ExerciseForm } from "@/components/exercise/exercise-form";
import toast from "@/integrations/toast";

export function CreateExerciseForm() {
	return (
		<ExerciseForm
			mode="create"
			onSuccess={() => {
				toast.success("Exercise created successfully");
			}}
		/>
	);
}
