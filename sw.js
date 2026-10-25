// MENON 手機網頁版的離線快取：第一次打開後，沒有網路也能玩。
// 遊戲本身（index.html 等）每個版本一份快取；圖片另外放一份長期快取（網址帶雜湊，圖沒變就不重新下載）。
const CACHE = "menon-1a88aed69d";
const IMG_CACHE = "menon-img";
const CORE = ["./", "index.html", "manifest.webmanifest", "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "icons/favicon-32.png"];
const IMAGES = ["img/agallos.webp?h=1fe95ba4be", "img/agallos_head.webp?h=2455aee7d6", "img/aivenna.webp?h=74e2e768b8", "img/aivenna_head.webp?h=e589cc7ea3", "img/bless_apollo.webp?h=2abb98a443", "img/bless_ares.webp?h=2b8bc51422", "img/bless_athena.webp?h=beaf297886", "img/bless_dionysus.webp?h=269889b47a", "img/bless_eleos.webp?h=9d7019e0b6", "img/bless_hades.webp?h=b51d17c5e2", "img/bless_hephaestus.webp?h=e2822e5ccc", "img/bless_hermes.webp?h=9bc751cb3e", "img/bless_poseidon.webp?h=c0ad919911", "img/bless_prometheus.webp?h=f0e0addee8", "img/bless_zeus.webp?h=34072054e9", "img/card_back.webp?h=d6aa3edc96", "img/cleon.webp?h=65743ca00b", "img/cleon_head.webp?h=4221496c83", "img/descend.webp?h=cd1ce4ce9e", "img/dream_well.webp?h=32ce47569c", "img/e_chariot.webp?h=77ad397d3d", "img/e_chariot_head.webp?h=234be54748", "img/e_cyclops_shepherd.webp?h=acabb1e3b2", "img/e_cyclops_shepherd_head.webp?h=3a442b5135", "img/e_dead_phalanx.webp?h=5310f9521b", "img/e_dead_phalanx_head.webp?h=ba1027ca12", "img/e_dream_beast.webp?h=2a364da740", "img/e_dream_beast_head.webp?h=f0f4333116", "img/e_erinyes.webp?h=51b4b1b9ac", "img/e_erinyes_head.webp?h=19b6530286", "img/e_hector.webp?h=b370e9397c", "img/e_hector_head.webp?h=035174ed65", "img/e_judges.webp?h=94c3a9f941", "img/e_judges_head.webp?h=053cb303cf", "img/e_kerberos.webp?h=a3d3daff58", "img/e_kerberos_head.webp?h=73af4fc2ff", "img/e_lion_gate.webp?h=28177cf4f1", "img/e_lion_gate_head.webp?h=8ea23a2cbf", "img/e_menon_name.webp?h=66605a0a74", "img/e_menon_name_head.webp?h=0c893ef019", "img/e_myrmidons.webp?h=5d4f3c7986", "img/e_myrmidons_head.webp?h=b50b1997b1", "img/e_priestess.webp?h=a74f423c2b", "img/e_priestess_head.webp?h=e6b48e2466", "img/e_sirens.webp?h=4d011a5ed4", "img/e_sirens_head.webp?h=14030ae492", "img/e_sisyphus_stone.webp?h=54f8e6cd84", "img/e_sisyphus_stone_head.webp?h=d9108098a1", "img/e_talos.webp?h=815d072f14", "img/e_talos_head.webp?h=b302596298", "img/eurion.webp?h=9989ebaa6a", "img/eurion_head.webp?h=cfae734e96", "img/frame_s1.webp?h=dac583dc21", "img/frame_s2.webp?h=81b404df85", "img/frame_s3.webp?h=0f51569075", "img/frame_s4.webp?h=bd44a42264", "img/frame_s5.webp?h=0a378b54f3", "img/frame_upg.webp?h=e6e18f58b4", "img/joker_momus.webp?h=4eb256d4d2", "img/map_bg.webp?h=6b597f791b", "img/map_bg_deep.webp?h=f720f94159", "img/menon.webp?h=a875033f88", "img/menon_head.webp?h=b1da2443d2", "img/mnes.webp?h=14901b9355", "img/mnes_head.webp?h=517ef793e4", "img/odysseus.webp?h=cb4935d91b", "img/odysseus_head.webp?h=b62b8640b5", "img/seyagales.webp?h=671edd4f00", "img/seyagales_head.webp?h=ae2ae80789", "img/title_art.webp?h=07fa0cde48", "img/vempolas.webp?h=177cb9d811", "img/vempolas_head.webp?h=2a1a6f5125"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE && k !== IMG_CACHE && k.startsWith("menon-")).map((k) => caches.delete(k)));
    // 圖片快取：拿掉這一版已經不用的舊網址，背景慢慢補齊缺的（不擋住遊戲）
    const ic = await caches.open(IMG_CACHE), want = new Set(IMAGES.map((u) => new URL(u, self.registration.scope).href));
    for (const req of await ic.keys()) if (!want.has(req.url)) await ic.delete(req);
    await self.clients.claim();
    (async () => { for (const u of want) { if (!(await ic.match(u))) { try { const r = await fetch(u); if (r.ok) await ic.put(u, r); } catch (err) { break; } } } })();
  })());
});
// 網路慢的時候不要一直等：超過幾秒就先用快取
const timeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);
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
  // 圖片：快取優先（網址帶雜湊，不會拿到舊圖）
  if (url.pathname.includes("/img/")) {
    e.respondWith(caches.open(IMG_CACHE).then(async (c) => {
      const hit = await c.match(req); if (hit) return hit;
      const r = await fetch(req); if (r.ok) c.put(req, r.clone()); return r;
    }));
    return;
  }
  // 遊戲本身：先用網路拿最新版；網路太慢（4 秒）或沒網路就用快取
  e.respondWith(timeout(fetch(req), 4000).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return r; })
    .catch(() => caches.match(req).then((hit) => hit || caches.match("index.html")).then((hit) => hit || fetch(req))));
});
