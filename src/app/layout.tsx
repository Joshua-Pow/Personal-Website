import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import "./globals.css";
import { ProgressiveBlur } from "@/components/ProgressiveBlur";
import { EdgeBorderEffect } from "@/components/EdgeBorderEffect";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { MotionLink } from "@/components/motion/MotionLink";

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
  metadataBase: new URL("https://joshuapow.com"),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "Joshua Pow",
    template: "%s | Joshua Pow",
  },
  description: "Joshua Pow is a computer engineer and web developer.",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
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
      >
        <body className="tracking-tight antialiased">
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
                <main className="relative flex w-full flex-grow flex-col">
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

const Footer = () => {
  const links = [
    { href: "https://x.com/joshpow_", label: "@JoshPow" },
    { href: "https://github.com/joshua-pow", label: "github" },
    { href: "https://linkedin.com/in/joshuapow", label: "linkedin" },
  ];

  return (
    <footer className="mb-24 mt-8 flex w-full items-center justify-center gap-6">
      {links.map((link) => (
        <MotionLink
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-orange-500"
        >
          {link.label}
        </MotionLink>
      ))}
    </footer>
  );
};
