const CACHE = "shorojontro-v2";

// Precache core app shell + assets for offline Local/AI play.
// (Online multiplayer still requires internet.)
const PRECACHE = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/sw.js",

  // backgrounds
  "/assets/bg.jpg",
  "/assets/home_bg.jpg",
  "/assets/game_bg.jpg",
  "/assets/pass_bg.jpg",

  // icons
  "/icons/icon-192.png",
  "/icons/icon-512.png",

  // role images
  "/images/bir_bikrom.jpg",
  "/images/mamdo_homdo.jpg",
  "/images/brohmodotto.jpg",
  "/images/betal.jpg",
  "/images/petuk_chondro.jpg",
  "/images/arun.jpg",
  "/images/kalu_dakat.jpg",
  "/images/chichke_chor.jpg",
  "/images/nantu_miah.jpg",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((c) =>
      c.addAll(PRECACHE)
    )
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;
  // PeerJS signaling should always go to network
  if (url.pathname.startsWith("/peerjs")) return;

  // Network-first for navigation (HTML), fallback to cached app shell
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put("/index.html", copy));
          return res;
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Cache-first for static assets, with runtime caching
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => cached);
    })
  );
});
