import type { MetadataRoute } from "next";

// Orbit as an installable app: its own window, the ring-and-sun mark on the home screen, and
// long-press shortcuts. Icons are drawn by scripts/make-icons.mjs (npm run icons).
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Orbit",
    short_name: "Orbit",
    description: "Every birthday is one more trip around the sun.",
    lang: "en",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FCF9F2",
    theme_color: "#FCF9F2",
    categories: ["lifestyle", "productivity"],
    // Opening Orbit again (from the icon or a shortcut) reuses the open window instead of a second one.
    launch_handler: { client_mode: ["navigate-existing", "auto"] },
    prefer_related_applications: false,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icons/monochrome-512.png", sizes: "512x512", type: "image/png", purpose: "monochrome" },
    ],
    shortcuts: [
      { name: "Add someone", short_name: "Add", url: "/people/new", icons: [{ src: "/icons/shortcut-add.png", sizes: "96x96", type: "image/png" }] },
      { name: "Find someone", short_name: "Find", url: "/people", icons: [{ src: "/icons/shortcut-people.png", sizes: "96x96", type: "image/png" }] },
      { name: "Calendar", url: "/calendar", icons: [{ src: "/icons/shortcut-calendar.png", sizes: "96x96", type: "image/png" }] },
    ],
  };
}
