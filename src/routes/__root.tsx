import type { QueryClient } from "@tanstack/react-query";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";

import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary";
import { EdgeBorderEffect } from "@/components/EdgeBorderEffect";
import { Footer } from "@/components/Footer";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { NotFound } from "@/components/NotFound";
import { ProgressiveBlur } from "@/components/ProgressiveBlur";
import { SfxProvider } from "@/components/SfxProvider";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site-metadata";

import appCss from "@/styles/app.css?url";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      { title: SITE_NAME },
      { name: "description", content: SITE_DESCRIPTION },
      { name: "theme-color", content: "#FFF8F4" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_US" },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:title", content: SITE_NAME },
      { property: "og:description", content: SITE_DESCRIPTION },
      { property: "og:image", content: `${SITE_URL}/icon.png` },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: SITE_NAME },
      { name: "twitter:description", content: SITE_DESCRIPTION },
      { name: "twitter:image", content: `${SITE_URL}/icon.png` },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
      {
        rel: "icon",
        type: "image/png",
        sizes: "96x96",
        href: "/favicon-96x96.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "512x512",
        href: "/icon.png",
      },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
    ],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: NotFound,
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="font-sans antialiased"
      style={{ colorScheme: "light" }}
    >
      <head>
        <HeadContent />
      </head>
      <body className="tracking-tight antialiased">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <MotionProvider>
          <SfxProvider>
            <EdgeBorderEffect
              blurSlot={
                <ProgressiveBlur
                  height="12%"
                  blurLevels={[0.5, 1, 2, 4, 8, 16, 32, 64]}
                />
              }
            >
              <div className="relative mx-auto flex min-h-full max-w-screen-sm flex-col justify-between">
                <main
                  id="main-content"
                  className="relative flex w-full flex-grow scroll-mt-4 flex-col"
                >
                  {children}
                </main>
                <Footer />
              </div>
            </EdgeBorderEffect>
          </SfxProvider>
        </MotionProvider>
        <Scripts />
      </body>
    </html>
  );
}
