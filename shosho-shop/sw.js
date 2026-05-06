const CACHE_NAME = 'shosho-v5';
const ASSETS = [
    '/',
    '/index.php',
    '/manifest.json',
    '/assets/css/style.css',
    '/assets/images/placeholder.png'
];

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    if (event.request.method === 'POST') return;
    // Network-first for CSS/JS to always get latest
    if (event.request.url.match(/\.(css|js)$/)) {
        event.respondWith(
            fetch(event.request).then(res => {
                const clone = res.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                return res;
            }).catch(() => caches.match(event.request))
        );
        return;
    }
    event.respondWith(
        caches.match(event.request).then(cached => cached || fetch(event.request))
    );
});

// Background sync for pending sales
self.addEventListener('sync', event => {
    if (event.tag === 'sync-sales') {
        event.waitUntil(syncPendingSales());
    }
});

// This function will be defined in db.js and imported here (not directly possible in service worker without importScripts)
// We'll keep the sync logic in the main thread; service worker simply triggers it.