// Service Worker for MKN GROUP PWA
const CACHE_NAME = 'mkngroup-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/hakkimizda',
  '/fason-uretim',
  '/ambalaj',
  '/e-ticaret',
  '/MKN-GROUP-LOGO.png',
  '/og-image.png',
  '/site.webmanifest'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed', error);
      })
  );
  
  // Skip waiting and immediately activate
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          // Update cache in background for next time
          fetch(event.request)
            .then((response) => {
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => cache.put(event.request, responseClone));
              }
            })
            .catch(() => {
              // Network failed, but we have cache
            });
          
          return cachedResponse;
        }
        
        // Not in cache, fetch from network
        return fetch(event.request)
          .then((response) => {
            // Only cache successful responses
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(event.request, responseClone));
            }
            return response;
          })
          .catch(() => {
            // Network failed and not in cache
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
            
            // For other requests, return a simple response
            return new Response('Offline content not available', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Background sync for form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'contact-sync') {
    event.waitUntil(
      // Handle offline form submissions
      console.log('Service Worker: Background sync for contact forms')
    );
  }
});

// Push notifications (future enhancement)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/android-chrome-192x192.png',
      badge: '/android-chrome-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || 1
      },
      actions: [
        {
          action: 'explore',
          title: 'Detayları Gör',
          icon: '/android-chrome-192x192.png'
        },
        {
          action: 'close',
          title: 'Kapat',
          icon: '/android-chrome-192x192.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'MKN GROUP', options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});