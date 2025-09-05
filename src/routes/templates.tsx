import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";

export const Route = createFileRoute("/templates")({
	component: RouteComponent,
});

function RouteComponent() {
	const templates = useQuery(api.templates.get);

	return <div>Hello "/templates"!</div>;
}
