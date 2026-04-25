import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ComradeOS | The Ultimate Campus Life Engine",
  description: "Survive, Grind, Thrive. A modular, scalable, offline-first ecosystem for Kenyan campus students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#10b981" />
      </head>
      <body className={`${inter.className} bg-slate-900 text-slate-100 min-h-screen`}>{children}</body>
    </html>
  );
}
