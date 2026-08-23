"use client";

import { useEffect } from "react";

export function PwaRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const base = window.location.pathname === "/booksmith-ai" || window.location.pathname.startsWith("/booksmith-ai/")
      ? "/booksmith-ai"
      : "";
    void navigator.serviceWorker.register(`${base}/sw.js`, { scope: `${base || ""}/` }).catch(() => {
      // Offline support is progressive enhancement; the authoring app remains usable without it.
    });
  }, []);

  return null;
}
