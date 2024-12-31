import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ViewTransitions } from "next-view-transitions";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en" className={`${inter.variable} antialiased`}>
        <body className="tracking-tight antialiased">
          <div className="relative mx-auto min-h-svh max-w-screen-sm">
            <main className="h-[calc(100svh-24px-1rem)] w-full">
              {children}
            </main>
            <Footer />
            {/* TODO: Add analytics */}
            <Analytics />
          </div>
        </body>
      </html>
    </ViewTransitions>
  );
}

const Footer = () => {
  const links = [
    { href: "https://x.com/joshpow_", label: "@JoshPow" },
    { href: "https://github.com/joshuapow", label: "github" },
    { href: "https://linkedin.com/in/joshuapow", label: "linkedin" },
  ];

  return (
    <footer className="absolute bottom-0 mb-4 flex w-full items-center justify-center gap-6">
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 transition-colors duration-200 hover:text-blue-500"
        >
          {link.label}
        </a>
      ))}
    </footer>
  );
};
