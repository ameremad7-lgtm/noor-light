const C = 'noor-v2';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './masajid.json'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(C).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== C).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  const freshFirst = req.mode === 'navigate' || url.pathname.endsWith('masajid.json');
  if (freshFirst) {
    e.respondWith(
      fetch(req).then((res) => {
        const cp = res.clone();
        caches.open(C).then((c) => c.put(req.mode === 'navigate' ? './index.html' : req, cp));
        return res;
      }).catch(() => caches.match(req.mode === 'navigate' ? './index.html' : req, { ignoreSearch: true }))
    );
    return;
  }
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) =>
      hit || fetch(req).then((res) => {
        const cp = res.clone();
        caches.open(C).then((c) => c.put(req, cp));
        return res;
      })
    )
  );
});
