import { TanstackDevtools } from "@tanstack/react-devtools";
import {
	HeadContent,
	Scripts,
	createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import ConvexProvider from "../integrations/convex/provider";

import StoreDevtools from "../lib/demo-store-devtools";

import { AppSidebar } from "@/components/sidebar";
import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Exercise Journal",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className="dark h-full">
			<head>
				<HeadContent />
				<link rel="manifest" href="/manifest.json" />
				<link rel="apple-touch-icon" href="/apple-touch-icon.png" />

				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-title" content="Exercise Journal" />
			</head>
			<body>
				<ConvexProvider>
					<SidebarProvider>
						<AppSidebar />

						<main className="flex-1 flex w-full flex-col gap-6 p-5 h-full">
							<SidebarTrigger />
							{children}
						</main>
					</SidebarProvider>
{/* 
					<TanstackDevtools
						config={{
							position: "bottom-left",
						}}
						plugins={[
							{
								name: "Tanstack Router",
								render: <TanStackRouterDevtoolsPanel />,
							},
							StoreDevtools,
						]}
					/> */}
				</ConvexProvider>
				<Scripts />
			</body>
		</html>
	);
}
