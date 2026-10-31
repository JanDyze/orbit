import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a phone on the home Wi-Fi (e.g. 192.168.1.10:3000) load dev scripts. Without it Next.js
  // blocks them for non-localhost origins and taps stop working. Dev server only.
  allowedDevOrigins: ["192.168.*.*"],
  experimental: {
    // When the connection drops, navigations and saves (a checklist tap) wait and retry once it's
    // back instead of failing; components/offline-notice.tsx says so.
    useOffline: true,
  },
  async headers() {
    return [
      {
        // The service worker must never be served from a cache, or an update could take days to land.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
};

export default nextConfig;
