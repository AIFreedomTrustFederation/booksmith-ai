const CACHE = "booksmith-shell-v1";

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const scope = self.registration.scope;
    const root = new URL("./", scope).toString();
    const studio = new URL("studio", scope).toString();
    const manifest = new URL("manifest.webmanifest", scope).toString();
    const icon = new URL("booksmith-icon.svg", scope).toString();
    const cache = await caches.open(CACHE);
    await Promise.allSettled([root, studio, manifest, icon].map((url) => cache.add(url)));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith("booksmith-shell-") && name !== CACHE).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        const cache = await caches.open(CACHE);
        cache.put(request, response.clone());
        return response;
      } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        return caches.match(new URL("studio", self.registration.scope).toString());
      }
    })());
    return;
  }

  if (["style", "script", "font", "image"].includes(request.destination)) {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(CACHE);
        cache.put(request, response.clone());
      }
      return response;
    })());
  }
});
