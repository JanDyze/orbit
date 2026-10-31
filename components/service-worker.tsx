"use client";

import { useEffect } from "react";

// Registers public/sw.js, which lets the installed app open offline. Production only: in dev it
// would serve stale pages over the code you're editing.
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {});
  }, []);
  return null;
}
