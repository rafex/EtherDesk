const CACHE_VERSION = 'v3';
const SHELL_CACHE_NAME = `etherdesk-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE_NAME = `etherdesk-runtime-${CACHE_VERSION}`;
const MONACO_ASSET_VERSION = '0.55.0-r1';
const MONACO_CACHE_NAME = `etherdesk-monaco-${MONACO_ASSET_VERSION}`;
const APP_SHELL = ['/', '/manifest.webmanifest', '/icons/icon-192.svg', '/icons/icon-512.svg'];
const MONACO_CDN_BASE = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.55.0/min/vs/';

function isStaticAsset(url) {
  return (
    url.origin === self.location.origin &&
    (url.pathname.startsWith('/assets/') ||
      url.pathname.startsWith('/icons/') ||
      url.pathname === '/' ||
      url.pathname === '/manifest.webmanifest')
  );
}

function isMonacoRemoteAsset(url) {
  return url.href.startsWith(MONACO_CDN_BASE);
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    }),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => ![SHELL_CACHE_NAME, RUNTIME_CACHE_NAME, MONACO_CACHE_NAME].includes(key))
          .map((key) => caches.delete(key)),
      );
    }),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);

  if (requestUrl.pathname.startsWith('/api/')) {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          const responseClone = networkResponse.clone();
          void caches.open(SHELL_CACHE_NAME).then((cache) => cache.put('/', responseClone));
          return networkResponse;
        })
        .catch(async () => {
          const cache = await caches.open(SHELL_CACHE_NAME);
        return (await cache.match('/')) || Response.error();
        }),
    );
    return;
  }

  if (!isStaticAsset(requestUrl) && !isMonacoRemoteAsset(requestUrl)) {
    return;
  }

  event.respondWith(
    (isMonacoRemoteAsset(requestUrl) ? caches.open(MONACO_CACHE_NAME) : caches.open(RUNTIME_CACHE_NAME)).then((targetCache) =>
      targetCache.match(event.request).then((cachedResponse) => {
      const networkFetch = fetch(event.request).then((networkResponse) => {
        if (networkResponse.ok && (requestUrl.origin === self.location.origin || isMonacoRemoteAsset(requestUrl))) {
          const responseClone = networkResponse.clone();
          void targetCache.put(event.request, responseClone);
        }

        return networkResponse;
      });

      if (cachedResponse) {
        void networkFetch;
        return cachedResponse;
      }

      return networkFetch;
      }),
    ),
  );
});

self.addEventListener('message', (event) => {
  const payload = event.data;
  if (!payload || payload.type !== 'etherdesk:precache-monaco' || payload.version !== MONACO_ASSET_VERSION || !Array.isArray(payload.assets)) {
    return;
  }

  event.waitUntil(
    caches.open(MONACO_CACHE_NAME).then(async (cache) => {
      await Promise.all(
        payload.assets.map(async (asset) => {
          try {
            const request = new Request(asset, { mode: 'cors' });
            const cached = await cache.match(request);
            if (cached) {
              return;
            }

            const response = await fetch(request);
            if (response.ok) {
              await cache.put(request, response.clone());
            }
          } catch {
            return;
          }
        }),
      );
    }),
  );
});
