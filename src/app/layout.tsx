import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import "./globals.css";
import { ProgressiveBlur } from "@/components/ProgressiveBlur";
import { EdgeBorderEffect } from "@/components/EdgeBorderEffect";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { Footer } from "@/components/Footer";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site-metadata";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/icon.png",
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/icon.png"],
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFF8F4",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html
        lang="en"
        className={`${inter.variable} ${instrumentSerif.variable} antialiased`}
        style={{ colorScheme: "light" }}
      >
        <body className="tracking-tight antialiased">
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <MotionProvider>
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
                  className="relative flex w-full flex-grow flex-col scroll-mt-4"
                >
                  {children}
                </main>
                <Footer />
              </div>
            </EdgeBorderEffect>
          </MotionProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
