// MENON 手機網頁版的離線快取：第一次打開後，沒有網路也能玩。
// 每次重新打包都會換版本號，舊快取會自動清掉。
const CACHE = "menon-474c86e22f";
const CORE = ["./", "index.html", "manifest.webmanifest", "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "icons/favicon-32.png", "img/agallos.jpg", "img/agallos_head.jpg", "img/aivenna.jpg", "img/aivenna_head.jpg", "img/cleon.jpg", "img/cleon_head.jpg", "img/eurion.jpg", "img/eurion_head.jpg", "img/menon.jpg", "img/menon_head.jpg", "img/mnes.jpg", "img/mnes_head.jpg", "img/seyagales.jpg", "img/seyagales_head.jpg", "img/vempolas.jpg", "img/vempolas_head.jpg", "img/bless_apollo.webp", "img/bless_ares.webp", "img/bless_athena.webp", "img/bless_dionysus.webp", "img/bless_eleos.webp", "img/bless_hades.webp", "img/bless_hephaestus.webp", "img/bless_hermes.webp", "img/bless_poseidon.webp", "img/bless_prometheus.webp", "img/bless_zeus.webp", "img/card_back.webp", "img/dream_well.webp", "img/e_chariot.webp", "img/e_chariot_head.webp", "img/e_cyclops_shepherd.webp", "img/e_cyclops_shepherd_head.webp", "img/e_dream_beast.webp", "img/e_dream_beast_head.webp", "img/e_hector.webp", "img/e_hector_head.webp", "img/e_lion_gate.webp", "img/e_lion_gate_head.webp", "img/e_menon_name.webp", "img/e_menon_name_head.webp", "img/e_myrmidons.webp", "img/e_myrmidons_head.webp", "img/e_priestess.webp", "img/e_priestess_head.webp", "img/e_sirens.webp", "img/e_sirens_head.webp", "img/e_talos.webp", "img/e_talos_head.webp", "img/joker_momus.webp", "img/map_bg.webp"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // 字型：先用快取，背景再更新
  if (url.hostname.endsWith("fonts.googleapis.com") || url.hostname.endsWith("fonts.gstatic.com")) {
    e.respondWith(caches.open(CACHE).then(async (c) => {
      const hit = await c.match(req);
      const net = fetch(req).then((r) => { if (r.ok || r.type === "opaque") c.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  if (url.origin !== location.origin) return;
  // 音樂檔：交給瀏覽器自己處理（播放時會分段下載，不能整段放進快取）
  if (url.pathname.includes("/music/")) return;
  // 遊戲本身：先用網路拿最新版，沒網路就用快取
  e.respondWith(fetch(req).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return r; })
    .catch(() => caches.match(req).then((hit) => hit || caches.match("index.html"))));
});
