const CACHE = "shorojontro-v5";

// Works on root deploy (Render) and subpath deploy (GitHub Pages)
const SCOPE_URL = new URL(self.registration.scope);
const abs = (p) => new URL(p, SCOPE_URL).toString();
const INDEX_URL = abs("index.html");

// Precache core app shell + assets for offline Local/AI play.
// (Online multiplayer still requires internet.)
const PRECACHE = [
  abs("./"),
  INDEX_URL,
  abs("manifest.webmanifest"),
  abs("sw.js"),

  // backgrounds
  abs("assets/bg.jpg"),
  abs("assets/home_bg.jpg"),
  abs("assets/game_bg.jpg"),
  abs("assets/pass_bg.jpg"),
  abs("assets/ui_bg.jpg"),
  abs("assets/gaming_bg.jpg"),

  // icons
  abs("icons/icon-192.png"),
  abs("icons/icon-512.png"),

  // role images
  abs("images/bir_bikrom.jpg"),
  abs("images/mamdo_homdo.jpg"),
  abs("images/brohmodotto.jpg"),
  abs("images/betal.jpg"),
  abs("images/petuk_chondro.jpg"),
  abs("images/arun.jpg"),
  abs("images/kalu_dakat.jpg"),
  abs("images/chichke_chor.jpg"),
  abs("images/nantu_miah.jpg"),
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
          caches.open(CACHE).then((c) => c.put(INDEX_URL, copy));
          return res;
        })
        .catch(() => caches.match(INDEX_URL))
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
