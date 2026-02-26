import { TemplateCard } from "@/components/templates/template-card";
import { TemplateFormDrawer } from "@/components/templates/template-form-drawer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "@/integrations/toast";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { LayoutTemplate, Plus } from "lucide-react";

export const Route = createFileRoute("/templates")({
	component: RouteComponent,
});

function RouteComponent() {
	const templates = useQuery(api.templates.get);
	const removeTemplate = useMutation(api.templates.remove);

	async function handleDelete(templateId: Id<"templates">) {
		await removeTemplate({ templateId });
		toast.success("Template deleted");
	}

	if (templates === undefined) {
		return (
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<Skeleton className="h-8 w-40" />
					<Skeleton className="h-9 w-24" />
				</div>
				{[...Array(3)].map((_, i) => (
					<Skeleton key={i} className="h-32 w-full rounded-xl" />
				))}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold tracking-tight">Templates</h1>
				<TemplateFormDrawer
					mode="create"
					trigger={
						<Button variant="outline" size="sm" className="font-display">
							<Plus className="size-4" />
							Create
						</Button>
					}
				/>
			</div>

			{templates.length === 0 ? (
				<div className="py-16 text-center">
					<LayoutTemplate className="size-10 mx-auto text-muted-foreground/40 mb-3" />
					<p className="text-muted-foreground">
						No templates yet. Create one to get started.
					</p>
				</div>
			) : (
				<div className="space-y-3">
					{templates.map((template) => (
						<TemplateCard
							key={template._id}
							template={template}
							onDelete={handleDelete}
						/>
					))}
				</div>
			)}
		</div>
	);
}
