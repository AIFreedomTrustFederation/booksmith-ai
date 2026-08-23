import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { PwaRegistration } from "./pwa-registration";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pagesBase = process.env.GITHUB_PAGES === "true" ? "/booksmith-ai" : "";

export const metadata: Metadata = {
  title: {
    default: "Booksmith AI — Living Manuscript Studio",
    template: "%s · Booksmith AI",
  },
  description:
    "Author-first manuscript intelligence, federated research memory, figures, provenance, proof, and publishing workflows for sovereign books.",
  manifest: `${pagesBase}/manifest.webmanifest`,
  icons: {
    icon: `${pagesBase}/booksmith-icon.svg`,
  },
  applicationName: "Booksmith AI",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        {children}
        <PwaRegistration />
      </body>
    </html>
  );
}
