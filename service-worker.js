const CACHE_NAME = 'shadow-monarch-v1.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/ui-evolution.css',
  '/css/responsive.css',
  '/js/main.js',
  '/js/three-app.js',
  '/js/game-systems/evolution-system.js',
  '/js/game-systems/combat-system.js',
  '/js/ui/touch-controls.js',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
            
          return response;
        });
      })
  );
});

// Gérer les sauvegardes hors ligne
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-save') {
    event.waitUntil(syncSaves());
  }
});

async function syncSaves() {
  // Synchroniser les sauvegardes quand la connexion revient
  const saves = await getOfflineSaves();
  
  for (const save of saves) {
    try {
      await uploadSave(save);
      await removeOfflineSave(save.id);
    } catch (error) {
      console.error('Erreur sync:', error);
    }
  }
}
