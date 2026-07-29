// bedda.ai Service Worker — offline shell + static asset caching
const CACHE_NAME = "bedda-v1";

// Core app shell to precache on install
const APP_SHELL = ["/", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Ignore non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Ignore cross-origin requests
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  // Ignore chrome-extension and other non-http(s) requests
  if (!request.url.startsWith("http")) {
    return;
  }

  const url = new URL(request.url);

  // API routes: network-first (always want fresh data), fall back to cache
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Don't cache non-ok responses
          if (!response.ok) {
            return response;
          }
          const cloned = response.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(request, cloned))
            .catch(() => {});
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Static assets (JS, CSS, fonts, images): cache-first for performance
  if (
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "font" ||
    request.destination === "image"
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(request).then((response) => {
          if (!response.ok) {
            return response;
          }
          const cloned = response.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(request, cloned))
            .catch(() => {});
          return response;
        });
      })
    );
    return;
  }

  // HTML navigation: network-first, fall back to cached homepage (offline shell)
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const cloned = response.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(request, cloned))
            .catch(() => {});
        }
        return response;
      })
      .catch(() => caches.match("/") || caches.match(request))
  );
});
