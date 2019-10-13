const cacheName = 'swCache';

const staticAssets = [
  './index.html',
  './match.js',
  './icons/8-ball-128.png',
  './icons/8-ball-512.png',
  'https://use.fontawesome.com/releases/v5.3.1/js/all.js',
  'https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css',
  'https://fonts.googleapis.com/css?family=Montserrat:400,700&display=swap',
  'https://cdn.jsdelivr.net/npm/vue/dist/vue.js'
]

self.addEventListener('install', async e => {
  const cache = await caches.open(cacheName);

  await cache.addAll(staticAssets);

  return self.skipWaiting();
});

self.addEventListener('activate', e => {
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);

  if (url.origin === location.origin) {
    e.respondWith(cacheFirst(req));
  } else {
    e.respondWith(networkAndCache(req));
  }
});

async function cacheFirst(req) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  return cached;
}

async function networkAndCache(req) {
  const cache = await caches.open(cacheName);

  try {
    const fresh = await fetch(req);
    await cache.put(req, fresh.clone());
    return fresh;
  } catch (e) {
    const cached = await cache.match(req);
    return cached;
  }
}