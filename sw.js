const CACHE = "pdc-v1";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const u = new URL(e.request.url);
  // Jamais intercepter l'API Supabase (données temps réel)
  if (u.host.endsWith(".supabase.co")) return;
  const cacheable = u.origin === location.origin || /cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|cdn\.tailwindcss\.com|fonts\.googleapis\.com|fonts\.gstatic\.com/.test(u.host);
  if (!cacheable) return;
  e.respondWith(
    caches.match(e.request).then(
      (hit) =>
        hit ||
        fetch(e.request)
          .then((res) => {
            if (res && res.status === 200) { const cl = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, cl)); }
            return res;
          })
          .catch(() => (u.origin === location.origin ? caches.match("./index.html") : undefined))
    )
  );
});
