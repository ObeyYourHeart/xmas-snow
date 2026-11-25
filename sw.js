// 圣诞雪境静态资源智能缓存 Service Worker
// 仅对 assets/ 下的大体积不可变静态资源 (.glb/.jpg/.png/.mp3/.wasm) 使用 Stale-While-Revalidate，
// 二次访问秒开免重下 36MB 资源；HTML / JS / CSS 始终走网络直连，确保代码更新立刻生效永不卡旧缓存。

const CACHE_NAME = "xmas-snow-assets-v4";
const ASSET_RE = /\/assets\/.*\.(?:glb|gltf|jpg|jpeg|png|webp|mp3|ogg|wav|wasm)$/i;

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith("xmas-snow-assets-") && k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (!ASSET_RE.test(url.pathname)) return;

  // Stale-While-Revalidate for binary assets: instant cache hit + background freshness check
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(req).then((cached) => {
        const netPromise = fetch(req)
          .then((resp) => {
            if (resp && resp.ok && resp.status === 200) {
              cache.put(req, resp.clone()).catch(() => {});
            }
            return resp;
          })
          .catch(() => cached);
        return cached || netPromise;
      })
    )
  );
});
