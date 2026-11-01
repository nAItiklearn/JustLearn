import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Perch — everything your inbox charges you for, on one perch",
  description:
    "Connect Gmail and Perch keeps a live shelf of every subscription, free trial, renewal date and event it can see — then quietly archives the ones that are over.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#fbfaf7",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('perch_theme')==='dark'){document.documentElement.classList.add('dark')}}catch(_){}`,
          }}
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
