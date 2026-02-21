import {
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	arrayMove,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Id } from "convex/_generated/dataModel";
import { GripVertical, X } from "lucide-react";

export interface SortableExercise {
	_id: Id<"exercises">;
	name: string;
}

interface SortableExerciseListProps {
	exercises: SortableExercise[];
	onReorder: (exercises: SortableExercise[]) => void;
	onRemove: (exerciseId: Id<"exercises">) => void;
}

function SortableExerciseRow({
	exercise,
	onRemove,
}: {
	exercise: SortableExercise;
	onRemove: (exerciseId: Id<"exercises">) => void;
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: exercise._id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`flex items-center gap-2 rounded-md border bg-background p-3 ${isDragging ? "opacity-50 shadow-lg" : ""}`}
		>
			<button
				type="button"
				className="touch-none cursor-grab text-muted-foreground hover:text-foreground"
				{...attributes}
				{...listeners}
			>
				<GripVertical className="size-4" />
			</button>
			<span className="flex-1 font-medium text-sm">{exercise.name}</span>
			<button
				type="button"
				className="text-muted-foreground hover:text-destructive"
				onClick={() => onRemove(exercise._id)}
			>
				<X className="size-4" />
			</button>
		</div>
	);
}

export function SortableExerciseList({
	exercises,
	onReorder,
	onRemove,
}: SortableExerciseListProps) {
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (over && active.id !== over.id) {
			const oldIndex = exercises.findIndex((e) => e._id === active.id);
			const newIndex = exercises.findIndex((e) => e._id === over.id);
			onReorder(arrayMove(exercises, oldIndex, newIndex));
		}
	}

	if (exercises.length === 0) {
		return (
			<div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
				No exercises added yet. Pick exercises below.
			</div>
		);
	}

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
		>
			<SortableContext
				items={exercises.map((e) => e._id)}
				strategy={verticalListSortingStrategy}
			>
				<div className="space-y-2">
					{exercises.map((exercise) => (
						<SortableExerciseRow
							key={exercise._id}
							exercise={exercise}
							onRemove={onRemove}
						/>
					))}
				</div>
			</SortableContext>
		</DndContext>
	);
}
