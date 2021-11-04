const FILES_CACHE  = [
    '/',
    '/index.html',
    '/favicon.ico',
    './css/styles.css',
    './js/index.js',
    './js/idb.js',
    './manifest.webmanifest',
    './icons/icon-512x512.png',
    './icons/icon-384x384.png',
    './icons/icon-192x192.png',
    './icons/icon-152x152.png',
    './icons/icon-144x144.png',
    './icons/icon-128x128.png',
    './icons/icon-96x96.png',
    './icons/icon-72x72.png',
  "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
  "https://cdn.jsdelivr.net/npm/chart.js@2.8.0"
];
const BeforeCACHE = 'Budget-v1';
const RUNTIME = 'Budget-runtime';

self.addEventListener('install', function(event) {
    console.log('used to register the service worker');
    event.waitUntil(
        caches.open(BeforeCACHE)
          .then(function(cache) {
            return cache.addAll(FILES_CACHE)
          })
          .then(self.skipWaiting())
      )
})
  
self.addEventListener('fetch', function(event) {
    console.log('used to intercept requests so we can check for the file or data in the cache');
    event.respondWith(
        fetch(event.request)
          .catch(() => {
            return caches.open(BeforeCACHE)
              .then((cache) => {
                return cache.match(event.request)
              })

          })
    )
})
  
self.addEventListener('activate', function(event) {
    console.log('this event triggers when the service worker activates');
    event.waitUntil(
        caches.keys()
          .then((keyList) => {
            return Promise.all(keyList.map((key) => {
              if (key !== BeforeCACHE) {
                console.log('[ServiceWorker] Removing old cache', key)
                return caches.delete(key)
              }
            }))
          })
          .then(() => self.clients.claim())
    )
})