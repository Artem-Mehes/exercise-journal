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

import { AppFooter } from "@/components/footer";
import { AppSidebar } from "@/components/sidebar";
import { WorkoutInfo } from "@/components/workout-info";
import appCss from "../styles.css?url";

// TODO
// Forms validation
// Loading state
// Toasts
// Delete oldest workouts when in db more than 10

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

				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-title" content="Exercise Journal" />
			</head>
			<body>
				<ConvexProvider>
					<SidebarProvider>
						<AppSidebar />

						<div className="flex flex-col  flex-1">
							<header className="bg-background border-b flex items-center justify-between p-2 min-h-14">
								<SidebarTrigger />

								<WorkoutInfo />
							</header>

							<main className="flex-1 flex w-full flex-col h-full overflow-auto">
								<div className="flex-1 overflow-auto p-3 space-y-4">
									{children}
								</div>
							</main>

							<AppFooter />
						</div>
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
