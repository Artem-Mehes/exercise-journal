import { ExerciseForm } from "@/components/exercise/exercise-form";
import type { Id } from "convex/_generated/dataModel";

interface EditExerciseFormProps {
	exerciseId: Id<"exercises">;
	onSuccess?: () => void;
}

export function EditExerciseForm({
	exerciseId,
	onSuccess,
}: EditExerciseFormProps) {
	return (
		<ExerciseForm mode="edit" exerciseId={exerciseId} onSuccess={onSuccess} />
	);
}
