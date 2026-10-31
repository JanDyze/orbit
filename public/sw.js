// Orbit's service worker: lets the installed app open with no connection.
//
// - Pages: always from the network when there is one, so what you see is never stale. Each page
//   that loads keeps its last good copy here; offline, that copy opens instead (the year, the
//   calendar, anyone you've looked at), and a page never opened shows /offline.
// - Build files (/_next/static, named by their content): from here once fetched, as they never change.
// - Everything else (Next.js's data requests, saves): straight to the network. With
//   experimental.useOffline, Next.js itself waits for the connection and retries them.
//
// Bump VERSION when this file changes in a way that should drop what's stored.
const VERSION = "orbit-1";
const SHELL = `${VERSION}-shell`;
const PAGES = `${VERSION}-pages`;
const ASSETS = `${VERSION}-assets`;

const OFFLINE_URL = "/offline";
const SHELL_URLS = [OFFLINE_URL, "/favicon.svg", "/icons/icon-192.png"];
// Signed-out and one-off pages are never kept.
const NEVER_KEEP = ["/login", "/auth", "/no-access", OFFLINE_URL];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const shell = await caches.open(SHELL);
      await shell.addAll(SHELL_URLS);
      // The offline page's own scripts, styles and fonts, so it renders fully with no connection.
      const html = await (await shell.match(OFFLINE_URL)).text();
      const assets = [...new Set(html.match(/\/_next\/static\/[^"'\s)]+/g) ?? [])];
      const store = await caches.open(ASSETS);
      await Promise.all(assets.map((url) => store.add(url).catch(() => {})));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((name) => !name.startsWith(`${VERSION}-`)).map((name) => caches.delete(name)));
      if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(page(event, url));
    return;
  }
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(fromCacheFirst(ASSETS, request));
    return;
  }
  if (SHELL_URLS.includes(url.pathname) || url.pathname.startsWith("/icons/") || url.pathname.startsWith("/splash/")) {
    event.respondWith(fromCacheFirst(SHELL, request));
  }
});

async function page(event, url) {
  const pages = await caches.open(PAGES);
  try {
    const response = (await event.preloadResponse) || (await fetch(event.request));
    // Signed out (the session ended, or someone else's phone): forget every kept page.
    if (response.redirected && new URL(response.url).pathname === "/login") {
      await caches.delete(PAGES);
    } else if (response.ok && response.type === "basic" && !response.redirected && !NEVER_KEEP.some((p) => url.pathname.startsWith(p))) {
      event.waitUntil(pages.put(event.request, response.clone()));
    }
    return response;
  } catch {
    return (
      (await pages.match(event.request)) ??
      (await pages.match(event.request, { ignoreSearch: true })) ??
      (await caches.match(OFFLINE_URL)) ??
      new Response("Orbit is offline.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } })
    );
  }
}

async function fromCacheFirst(name, request) {
  const cache = await caches.open(name);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}
