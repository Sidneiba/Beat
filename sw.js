const CACHE_NAME = "mercado-bairro-v3";
const urlsToCache = [
    "/",
    "/index.html",
    "/login.html",
    "/cadastro.html",
    "/client.html",
    "/stock.html",
    "/css/style.css",
    "/js/app.js",
    "/manifest.json",
    "/assets/welcome.mp3",
    "https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap",
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => response || fetch(event.request))
    );
});

self.addEventListener("activate", event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames =>
            Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            )
        )
    );
});
