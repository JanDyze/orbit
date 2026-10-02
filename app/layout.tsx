import type { Metadata, Viewport } from "next";
import { Geist, Nunito } from "next/font/google";
import { TimezoneSync } from "@/components/timezone-sync";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

// Rounded display face for the wordmark and headings, close to the logo's lettering.
const brand = Nunito({
  variable: "--font-brand",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Orbit", template: "%s · Orbit" },
  description: "Every birthday is one more trip around the sun.",
  applicationName: "Orbit",
  appleWebApp: { capable: true, title: "Orbit", statusBarStyle: "default" },
  icons: {
    icon: [{ url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" }],
    apple: "/icons/apple-touch-icon.png",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FCF9F2" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1b3d" },
  ],
  // Installed, the app draws under the notch and home bar; bars pad themselves with safe-area insets.
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${brand.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <TimezoneSync />
        {children}
      </body>
    </html>
  );
}
