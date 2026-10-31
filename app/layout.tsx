import type { Metadata, Viewport } from "next";
import { Geist, Nunito } from "next/font/google";
import { OfflineNotice } from "@/components/offline-notice";
import { ServiceWorker } from "@/components/service-worker";
import { TimezoneSync } from "@/components/timezone-sync";
import { startupImages } from "@/lib/splash";
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
  appleWebApp: { capable: true, title: "Orbit", statusBarStyle: "default", startupImage: startupImages() },
  // Drawn by scripts/make-icons.mjs. The SVG follows light and dark tabs; the .ico is for the rest.
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  // The page color in each theme, so the status bar and the browser's chrome run into the page.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FCF9F2" },
    { media: "(prefers-color-scheme: dark)", color: "#061431" },
  ],
  // Installed, the app draws under the notch and home bar; bars pad themselves with safe-area insets.
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${brand.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <TimezoneSync />
        <ServiceWorker />
        <OfflineNotice />
        {children}
      </body>
    </html>
  );
}
