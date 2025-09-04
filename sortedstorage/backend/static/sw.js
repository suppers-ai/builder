const CACHE_NAME = 'sortedstorage-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Files to cache on install
const STATIC_FILES = [
  '/',
  '/manifest.json',
  '/offline.html'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[ServiceWorker] Caching static files');
      return cache.addAll(STATIC_FILES);
    })
  );
  
  // Force the new service worker to become active
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== STATIC_CACHE && 
                   cacheName !== DYNAMIC_CACHE;
          })
          .map((cacheName) => {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip WebSocket connections
  if (url.protocol === 'ws:' || url.protocol === 'wss:') {
    return;
  }
  
  // API calls - network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      networkFirst(request, DYNAMIC_CACHE)
    );
    return;
  }
  
  // Static assets - cache first, fallback to network
  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      cacheFirst(request, STATIC_CACHE)
    );
    return;
  }
  
  // HTML pages - network first with offline fallback
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      networkFirst(request, DYNAMIC_CACHE).catch(() => {
        return caches.match('/offline.html');
      })
    );
    return;
  }
  
  // Default - network first
  event.respondWith(
    networkFirst(request, DYNAMIC_CACHE)
  );
});

// Cache strategies

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[ServiceWorker] Fetch failed:', error);
    throw error;
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    
    if (cached) {
      return cached;
    }
    
    throw error;
  }
}

function isStaticAsset(pathname) {
  const staticExtensions = [
    '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg',
    '.woff', '.woff2', '.ttf', '.eot', '.ico'
  ];
  
  return staticExtensions.some(ext => pathname.endsWith(ext));
}

// Background sync for offline uploads
self.addEventListener('sync', (event) => {
  if (event.tag === 'upload-queue') {
    event.waitUntil(processUploadQueue());
  }
});

async function processUploadQueue() {
  // Get queued uploads from IndexedDB
  const uploads = await getQueuedUploads();
  
  for (const upload of uploads) {
    try {
      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        body: upload.formData
      });
      
      if (response.ok) {
        await removeFromQueue(upload.id);
        
        // Notify the client
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'upload-complete',
              uploadId: upload.id
            });
          });
        });
      }
    } catch (error) {
      console.error('[ServiceWorker] Upload failed:', error);
    }
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'New notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'view',
        title: 'View'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('SortedStorage', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Placeholder functions for IndexedDB operations
async function getQueuedUploads() {
  // Implementation would use IndexedDB to get queued uploads
  return [];
}

async function removeFromQueue(id) {
  // Implementation would remove from IndexedDB
}