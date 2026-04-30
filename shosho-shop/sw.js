const CACHE_NAME = 'shosho-v3';
const ASSETS = [
    '/',
    '/index.php',
    '/manifest.json',
    '/assets/css/style.css',
    '/assets/images/placeholder.png'
];

self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', event => {
    if (event.request.method === 'POST') return; // Let API calls pass through
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