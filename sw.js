self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open('mdb-cache-v1').then((cache) => {
            return cache.addAll([
                '/',
                '/client.html',
                '/stock.html',
                '/caixa.html',
                '/styles.css',
                '/app.js',
                '/manifest.json',
                '/icon-180.png',
                '/icon-512.png'
            ]);
        })
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        })
    );
});
