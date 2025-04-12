const CACHE_NAME = 'mercado-bairro-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/login.html',
    '/cadastro.html',
    '/client.html',
    '/stock.html',
    '/caixa.html',
    '/css/style.css',
    '/js/app.js',
    '/manifest.json',
    '/assets/web-app-manifest-512x512.png',
    '/assets/apple-touch-icon.png',
    '/assets/favicon-96x96.png',
    '/assets/web-app-manifest-192x192.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
