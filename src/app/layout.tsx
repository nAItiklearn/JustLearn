import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GradualBlur } from "@/components/GradualBlur";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "TenMinRabbitHole — 10-Minute Curiosity Sprints & Feynman Synthesis",
  description: "A minimalist cognitive sprint. 10 minutes on physical paper. Synthesize from memory. Rated 1 to 10 by peers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <head>
        {/* Anti-FOUC script for instant night theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('tmrh_theme') === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col relative antialiased font-sans selection:bg-amber-200 selection:text-neutral-900 dark:selection:bg-neutral-800 dark:selection:text-white transition-colors duration-300">
        {/* Visible theme gradient background */}
        <div
          className="pointer-events-none fixed inset-0 -z-10 overflow-hidden transition-all duration-500"
          style={{
            backgroundImage: "var(--bg-gradient)",
            backgroundColor: "var(--bg-color)",
          }}
          aria-hidden="true"
        />

        {/* Gradual blur top bar */}
        <GradualBlur />

        {/* Minimalist Navigation with top-left Theme Toggle */}
        <Navbar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">{children}</div>

        {/* Minimalist Footer */}
        <Footer />
      </body>
    </html>
  );
}
