// MENON 手機網頁版的離線快取：第一次打開後，沒有網路也能玩。
// 外殼（index.html 等）每個版本一份快取；遊戲程式與各語言資料檔名帶雜湊，放在 menon-assets（內容沒變就一直用）；
// 圖片另外放一份長期快取（網址帶雜湊，圖沒變就不重新下載）。
//
// 首頁（index.html）先用快取、不等網路（效能第五輪，docs/perf-2026-11-16.md）。新版怎麼到玩家手上：
//   VERSION 是 index.html 內容的雜湊（build/build.js 填入），所以每次發佈 index.html 有變，sw.js 就跟著變。
//   瀏覽器每次開啟都會繞過 HTTP 快取檢查 sw.js；有新版就在背景安裝（install 先把新版的 index.html、遊戲程式存好），
//   接著立刻接手（skipWaiting＋clients.claim），頁面收到 controllerchange 顯示「有新版本，點這裡重新整理」。
//   玩家不點也沒關係：下一次開啟就是新版。也就是發佈後第二次開啟會在背景更新，最晚第三次開啟一定是新版。
const VERSION = "2da12ed6c6";
const CACHE = "menonpv-" + VERSION;
const META = "menonpv-meta"; // 記上一版用到的程式／資料檔（清舊檔時保留一代，見 activate）
const IMG_CACHE = "menonpv-img";
const ASSET_CACHE = "menonpv-assets";
const APP = ["app.6b15d93cbd.js", "app.1ee55bc30c.css"];
const ASSETS = ["app.6b15d93cbd.js", "app.1ee55bc30c.css", "data.zh.9a9700e8eb.js", "late.zh.7776e4ee81.js", "data.zhs.26c38552a3.js", "late.zhs.30f1afb46c.js", "data.en.67c638c822.js", "late.en.9f20c5e182.js", "data.ja.91f735f04a.js", "late.ja.8724ed1e21.js", "data.es.e7c271aa4d.js", "late.es.cd440b3926.js", "data.ko.00d556d8ba.js", "late.ko.567565c810.js"];
const CORE = ["./", "index.html", "manifest.webmanifest", "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "icons/favicon-32.png"];
const IMAGES = ["img/agallos.webp?h=1fe95ba4be", "img/agallos_head.webp?h=2455aee7d6", "img/aivenna.webp?h=74e2e768b8", "img/aivenna_head.webp?h=e589cc7ea3", "img/bless_apollo.webp?h=2abb98a443", "img/bless_ares.webp?h=2b8bc51422", "img/bless_athena.webp?h=beaf297886", "img/bless_dionysus.webp?h=269889b47a", "img/bless_eleos.webp?h=9d7019e0b6", "img/bless_hades.webp?h=b51d17c5e2", "img/bless_hephaestus.webp?h=e2822e5ccc", "img/bless_hermes.webp?h=9bc751cb3e", "img/bless_poseidon.webp?h=c0ad919911", "img/bless_prometheus.webp?h=f0e0addee8", "img/bless_zeus.webp?h=34072054e9", "img/card_back.webp?h=d6aa3edc96", "img/cleon.webp?h=65743ca00b", "img/cleon_head.webp?h=4221496c83", "img/descend.webp?h=cd1ce4ce9e", "img/dream_well.webp?h=32ce47569c", "img/e_chariot.webp?h=77ad397d3d", "img/e_chariot_head.webp?h=234be54748", "img/e_cyclops_shepherd.webp?h=acabb1e3b2", "img/e_cyclops_shepherd_head.webp?h=3a442b5135", "img/e_dead_phalanx.webp?h=5310f9521b", "img/e_dead_phalanx_head.webp?h=ba1027ca12", "img/e_dream_beast.webp?h=2a364da740", "img/e_dream_beast_head.webp?h=f0f4333116", "img/e_erinyes.webp?h=51b4b1b9ac", "img/e_erinyes_head.webp?h=19b6530286", "img/e_hector.webp?h=b370e9397c", "img/e_hector_head.webp?h=035174ed65", "img/e_judges.webp?h=94c3a9f941", "img/e_judges_head.webp?h=053cb303cf", "img/e_kerberos.webp?h=a3d3daff58", "img/e_kerberos_head.webp?h=73af4fc2ff", "img/e_lion_gate.webp?h=28177cf4f1", "img/e_lion_gate_head.webp?h=8ea23a2cbf", "img/e_menon_name.webp?h=66605a0a74", "img/e_menon_name_head.webp?h=0c893ef019", "img/e_myrmidons.webp?h=5d4f3c7986", "img/e_myrmidons_head.webp?h=b50b1997b1", "img/e_priestess.webp?h=a74f423c2b", "img/e_priestess_head.webp?h=e6b48e2466", "img/e_sirens.webp?h=4d011a5ed4", "img/e_sirens_head.webp?h=14030ae492", "img/e_sisyphus_stone.webp?h=54f8e6cd84", "img/e_sisyphus_stone_head.webp?h=d9108098a1", "img/e_talos.webp?h=815d072f14", "img/e_talos_head.webp?h=b302596298", "img/eurion.webp?h=9989ebaa6a", "img/eurion_head.webp?h=cfae734e96", "img/frame_s1.webp?h=dac583dc21", "img/frame_s2.webp?h=81b404df85", "img/frame_s3.webp?h=0f51569075", "img/frame_s4.webp?h=bd44a42264", "img/frame_s5.webp?h=0a378b54f3", "img/frame_upg.webp?h=e6e18f58b4", "img/joker_momus.webp?h=4eb256d4d2", "img/map_bg.webp?h=6b597f791b", "img/map_bg_deep.webp?h=f720f94159", "img/menon.webp?h=a875033f88", "img/menon_head.webp?h=b1da2443d2", "img/nightmare.webp?h=af0ff3347c", "img/nightmare_head.webp?h=1dedbcd507", "img/mnes.webp?h=14901b9355", "img/mnes_head.webp?h=517ef793e4", "img/odysseus.webp?h=cb4935d91b", "img/odysseus_head.webp?h=b62b8640b5", "img/seyagales.webp?h=671edd4f00", "img/seyagales_head.webp?h=ae2ae80789", "img/title_art.webp?h=07fa0cde48", "img/vempolas.webp?h=177cb9d811", "img/vempolas_head.webp?h=2a1a6f5125"];

// 這一版的首頁：一定要繞過 HTTP 快取拿（GitHub Pages 的 max-age=600 可能還留著舊版），
// 並確認內容就是這一版（雜湊等於 VERSION）。CDN 還沒更新完、拿到舊的時，再試一次；還是對不上就不存首頁，
// 開啟時改走網路（和第四輪以前一樣），不會把舊首頁存成新版、卡在舊版。
const hex10 = async (buf) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", buf))].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 10);
async function cacheShell(c) {
  for (const mode of ["reload", "no-store"]) {
    try {
      const r = await fetch(new Request("index.html", { cache: mode }));
      if (r.ok && (await hex10(await r.clone().arrayBuffer())) === VERSION) return Promise.all([c.put("index.html", r.clone()), c.put("./", r)]);
    } catch (err) {}
  }
}
const isShell = (req, url) => req.mode === "navigate" && (url.pathname === SCOPE.pathname || url.pathname === SCOPE.pathname + "index.html");
const SCOPE = new URL(self.registration.scope);

self.addEventListener("install", (e) => {
  // 外殼與遊戲程式先存好；語言資料由頁面告訴我們用哪一種（message: cache）
  e.waitUntil(Promise.all([
    caches.open(CACHE).then((c) => Promise.all([cacheShell(c), c.addAll(CORE.filter((u) => u !== "./" && u !== "index.html").map((u) => new Request(u, { cache: "reload" })))])),
    caches.open(ASSET_CACHE).then(async (c) => { for (const u of APP) if (!(await c.match(u))) await c.add(u); }),
  ]).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE && k !== IMG_CACHE && k !== ASSET_CACHE && k !== META && k.startsWith("menonpv-")).map((k) => caches.delete(k)));
    // 舊版的程式與資料檔：這一版和上一版都沒用到的就刪掉。
    // 上一版留一代：新版接手時，還開著的舊版分頁可能還要讀舊的語言資料或 late 檔（伺服器上已經換掉了）。
    const mc = await caches.open(META), prevRes = await mc.match("assets");
    let prev = [];
    try { prev = prevRes ? await prevRes.json() : []; } catch (err) {}
    const abs = (u) => new URL(u, self.registration.scope).href;
    const ac = await caches.open(ASSET_CACHE), keep = new Set([...ASSETS, ...(Array.isArray(prev) ? prev : [])].map(abs));
    for (const req of await ac.keys()) if (!keep.has(req.url)) await ac.delete(req);
    await mc.put("assets", new Response(JSON.stringify(ASSETS), { headers: { "content-type": "application/json" } }));
    // 圖片快取：拿掉這一版已經不用的舊網址，背景慢慢補齊缺的（不擋住遊戲）
    const ic = await caches.open(IMG_CACHE), want = new Set(IMAGES.map((u) => new URL(u, self.registration.scope).href));
    for (const req of await ic.keys()) if (!want.has(req.url)) await ic.delete(req);
    await self.clients.claim();
    // 省流量模式或 2G：不在背景下載圖片，用到才下載
    const conn = self.navigator && self.navigator.connection;
    const thrifty = conn && (conn.saveData || /2g/.test(conn.effectiveType || ""));
    if (!thrifty) (async () => { await new Promise((r) => setTimeout(r, 15000)); for (const u of want) { if (!(await ic.match(u))) { try { const r = await fetch(u); if (r.ok) await ic.put(u, r); } catch (err) { break; } } } })();
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
      // 跨網域的字型 CSS 是 opaque 回應（看不到狀態碼），只能照存；看得到狀態的只存成功的
      const net = fetch(req).then((r) => { if (r.ok || (r.type === "opaque" && !hit)) c.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  if (url.origin !== location.origin) return;
  // 音樂檔：交給瀏覽器自己處理（播放時會分段下載，不能整段放進快取）
  if (url.pathname.includes("/music/")) return;
  // 首頁：先用這一版存好的（不等網路）；新版靠 sw.js 更新帶進來（見檔頭）。沒存到才走下面的網路優先。
  // 只認這個 Service Worker 自己範圍的首頁（正式版的 sw.js 範圍也包含 preview/，不能拿正式版的首頁回給預覽版）
  if (isShell(req, url)) {
    e.respondWith(caches.open(CACHE).then((c) => c.match("index.html")).then((hit) => hit || shellFromNet(req)));
    return;
  }
  // 程式與語言資料：檔名帶雜湊，快取優先
  if (/\/(app|data|late)\.[\w.-]+\.(js|css)$/.test(url.pathname)) {
    e.respondWith(caches.open(ASSET_CACHE).then(async (c) => {
      const hit = await c.match(req, { ignoreSearch: true }); if (hit) return hit;
      const r = await fetch(req); if (r.ok) c.put(req, r.clone()); return r;
    }));
    return;
  }
  // 圖片：快取優先（網址帶雜湊，不會拿到舊圖）
  if (url.pathname.includes("/img/")) {
    e.respondWith(caches.open(IMG_CACHE).then(async (c) => {
      const hit = await c.match(req); if (hit) return hit;
      const r = await fetch(req); if (r.ok) c.put(req, r.clone()); return r;
    }));
    return;
  }
  // 其他（隱私權頁面、圖示…）：先用網路拿最新版；網路太慢（4 秒）或沒網路就用快取
  e.respondWith(netFirst(req));
});
// 只快取成功的回應：404／500 之類的錯誤頁不能蓋掉快取裡好的那一份
const netFirst = (req) => timeout(fetch(req), 4000).then((r) => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); } return r; })
  .catch(() => caches.match(req).then((hit) => hit || caches.match("index.html")).then((hit) => hit || fetch(req)));
// 首頁沒存到（安裝時拿到的版本對不上）：照舊網路優先。
// 拿到的內容是這一版就存成 index.html（之後就先用快取）；不是這一版只存成離線備用，不會被當成這一版一直用下去。
// （no-cache：GitHub Pages 的 max-age=600 不能讓這裡拿到 10 分鐘前的舊首頁；沒變時伺服器只回 304）
const shellFromNet = (req) => timeout(fetch(new Request(req.url, { cache: "no-cache", credentials: "same-origin" })), 4000)
  .then(async (r) => {
    if (r.ok) {
      const copy = r.clone(), ok = (await hex10(await r.clone().arrayBuffer())) === VERSION;
      caches.open(CACHE).then((c) => c.put(ok ? "index.html" : "index.html?offline", copy));
    }
    return r;
  })
  .catch(() => caches.open(CACHE).then(async (c) => (await c.match("index.html")) || (await c.match("index.html?offline")) || fetch(req)));

// 頁面要求先存好某些檔案（例如目前語言的資料、切換語言前先確認拿得到）
self.addEventListener("message", (e) => {
  const d = e.data || {};
  if (d.type === "cache" && Array.isArray(d.urls)) {
    e.waitUntil(caches.open(ASSET_CACHE).then(async (c) => { for (const u of d.urls) { if (!(await c.match(u))) { try { await c.add(u); } catch (err) {} } } }));
  }
});
