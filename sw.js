const DV_CACHE_NAME = "dv-ai-shell-v1";
const DV_SHELL_FILES = [
  "./",
  "./index.html",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(DV_CACHE_NAME).then((cache) => cache.addAll(DV_SHELL_FILES)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== DV_CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Never cache the Apps Script backend
  if (url.hostname.includes("script.google.com") || url.hostname.includes("googleusercontent.com")) {
    return;
  }

  // Only handle GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // Allow local files AND your external image domain
  if (url.origin !== self.location.origin && !url.hostname.includes("https://i.ibb.co/C3m98rkZ/file-000000006cfc820aa0d96dec342a6c44.png")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(DV_CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});


