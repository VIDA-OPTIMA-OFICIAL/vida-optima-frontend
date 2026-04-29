const CACHE_NAME = 'vida-optima-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/engine.js',
  '/modules.js',
  '/app.js',
  '/manifest.json'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Responder con cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

