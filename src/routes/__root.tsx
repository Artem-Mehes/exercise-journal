import {
	HeadContent,
	Scripts,
	createRootRouteWithContext,
} from "@tanstack/react-router";

import { SidebarProvider } from "@/components/ui/sidebar";
import ConvexProvider from "../integrations/convex/provider";

import { AppFooter } from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";
import { WorkoutInfo } from "@/components/workout-info";
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

				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-title" content="Exercise Journal" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, maximum-scale=1"
				/>
			</head>
			<body>
				<Toaster richColors />

				<ConvexProvider>
					<SidebarProvider>
						<div className="flex flex-col flex-1">
							<header className="bg-card/60 backdrop-blur-md border-b border-border/60 flex items-center justify-between px-4 py-2 min-h-14 w-full sticky top-0 z-40">
								<WorkoutInfo />
							</header>

							<main className="flex-1 flex w-full flex-col h-full overflow-auto">
								<div className="flex-1 overflow-auto px-4 py-4 space-y-5">
									{children}
								</div>
							</main>

							<AppFooter />
						</div>
					</SidebarProvider>
				</ConvexProvider>
				<Scripts />
			</body>
		</html>
	);
}
