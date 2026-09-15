// Vicauria 資產配置工作台 — Service Worker
// 策略：網路優先（network-first）。有網路時一律抓最新版本，
// 只有離線或網路失敗時才退回快取版本 —— 這樣你之後每次更新上傳新檔案，
// 顧問打開 App 只要有網路，看到的永遠是最新版，不會被舊快取卡住。

const CACHE_VERSION = 'vicauria-v1';
const APP_SHELL = [
  './',
  './index.html',
  './login.html',
  './workbench.html',
  './brand-story.html',
  './manifest.json',
  './modules/home.html',
  './modules/cashflow.html',
  './modules/balance.html',
  './modules/loan.html',
  './modules/efficiency.html',
  './modules/blueprint.html',
  './modules/simulation.html',
  './modules/client-records.html',
  './modules/market-news.html',
  './modules/market-overview.html',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // 只處理同網域、GET 請求；外部 API（新聞、匯率、TradingView 等）一律直接放行給網路，
  // 不快取也不攔截，確保這些即時資料永遠是抓最新的。
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(req)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(req, resClone)).catch(()=>{});
        return res;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match('./workbench.html')))
  );
});
