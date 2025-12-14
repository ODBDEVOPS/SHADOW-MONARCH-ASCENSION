// Service Worker amélioré pour Shadow Monarch Ascension
const CACHE_VERSION = 'v2.0.0';
const CACHE_NAME = `shadow-monarch-${CACHE_VERSION}`;

// Assets critiques
const CRITICAL_ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/css/ui-evolution.css',
    '/css/responsive.css',
    '/js/main.js',
    '/js/three-app.js',
    '/js/game-systems/evolution-system.js',
    '/manifest.json',
    '/assets/icons/icon-192.png',
    '/assets/icons/icon-512.png'
];

// Assets optionnels (chargés en arrière-plan)
const OPTIONAL_ASSETS = [
    '/assets/audio/',
    '/assets/models/',
    '/assets/textures/'
];

// Installer le Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Installation du cache:', CACHE_NAME);
                return cache.addAll(CRITICAL_ASSETS);
            })
            .then(() => {
                console.log('Tous les assets critiques ont été mis en cache');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Erreur lors de l\'installation du cache:', error);
            })
    );
});

// Activer et nettoyer les anciens caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Suppression de l\'ancien cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker activé avec succès');
                return self.clients.claim();
            })
    );
});

// Intercepter les requêtes
self.addEventListener('fetch', (event) => {
    // Ne pas intercepter les requêtes vers l'API
    if (event.request.url.includes('/api/')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Retourner la réponse en cache si disponible
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                // Sinon, aller sur le réseau
                return fetch(event.request)
                    .then((response) => {
                        // Vérifier si la réponse est valide
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Mettre en cache la réponse
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // Fallback pour les pages
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match('/index.html');
                        }
                        
                        // Fallback pour les images
                        if (event.request.headers.get('accept').includes('image')) {
                            return caches.match('/assets/icons/icon-192.png');
                        }
                    });
            })
    );
});

// Synchronisation en arrière-plan
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-saves') {
        event.waitUntil(syncGameSaves());
    }
    
    if (event.tag === 'sync-scores') {
        event.waitUntil(syncLeaderboard());
    }
});

// Gestion du push
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const options = {
        body: data.body || 'Nouvelle notification de Shadow Monarch',
        icon: '/assets/icons/icon-192.png',
        badge: '/assets/icons/badge.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/'
        },
        actions: [
            {
                action: 'open',
                title: 'Ouvrir'
            },
            {
                action: 'close',
                title: 'Fermer'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'Shadow Monarch', options)
    );
});

// Clic sur notification
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    }
});

// Fonctions de synchronisation
async function syncGameSaves() {
    const saves = await getOfflineSaves();
    
    for (const save of saves) {
        try {
            await uploadSaveToCloud(save);
            await removeOfflineSave(save.id);
            console.log(`Sauvegarde ${save.id} synchronisée`);
        } catch (error) {
            console.error('Erreur synchronisation sauvegarde:', error);
        }
    }
}

async function syncLeaderboard() {
    const scores = await getOfflineScores();
    
    for (const score of scores) {
        try {
            await uploadScoreToLeaderboard(score);
            await removeOfflineScore(score.id);
        } catch (error) {
            console.error('Erreur synchronisation score:', error);
        }
    }
}

// Stockage IndexedDB pour données hors ligne
const openDatabase = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('ShadowMonarchOffline', 1);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            if (!db.objectStoreNames.contains('saves')) {
                db.createObjectStore('saves', { keyPath: 'id' });
            }
            
            if (!db.objectStoreNames.contains('scores')) {
                db.createObjectStore('scores', { keyPath: 'id' });
            }
            
            if (!db.objectStoreNames.contains('pendingRequests')) {
                db.createObjectStore('pendingRequests', { keyPath: 'id' });
            }
        };
        
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

async function getOfflineSaves() {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['saves'], 'readonly');
        const store = transaction.objectStore('saves');
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Préchargement intelligent
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'PRECACHE_ASSETS') {
        const assets = event.data.assets;
        event.waitUntil(precacheAssets(assets));
    }
});

async function precacheAssets(assets) {
    const cache = await caches.open(CACHE_NAME);
    
    for (const asset of assets) {
        try {
            await cache.add(asset);
        } catch (error) {
            console.warn(`Impossible de précharger ${asset}:`, error);
        }
    }
}

// Gestion de la bande passante
const isSlowConnection = () => {
    if ('connection' in navigator) {
        const connection = navigator.connection;
        return connection.saveData || 
               connection.effectiveType === 'slow-2g' || 
               connection.effectiveType === '2g';
    }
    return false;
};

// Version checking
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'check-updates') {
        event.waitUntil(checkForUpdates());
    }
});

async function checkForUpdates() {
    try {
        const response = await fetch('/version.json', { cache: 'no-store' });
        const data = await response.json();
        
        if (data.version !== CACHE_VERSION) {
            // Nouvelle version disponible
            self.registration.showNotification('Mise à jour disponible!', {
                body: 'Une nouvelle version de Shadow Monarch est disponible.',
                icon: '/assets/icons/icon-192.png',
                actions: [
                    { action: 'update', title: 'Mettre à jour' },
                    { action: 'dismiss', title: 'Plus tard' }
                ]
            });
        }
    } catch (error) {
        console.error('Erreur vérification mise à jour:', error);
    }
}
