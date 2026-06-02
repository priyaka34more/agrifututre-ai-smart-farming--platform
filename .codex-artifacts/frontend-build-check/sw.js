// 🌿 SERVICE WORKER FOR OFFLINE CACHING

const CACHE_NAME = 'agrifuture-v1';
const STATIC_CACHE = 'agrifuture-static-v1';
const API_CACHE = 'agrifuture-api-v1';

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/css/main.css',
  '/static/js/main.js',
  '/static/media/logo.png'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/v1/weather',
  '/api/v1/market',
  '/api/v1/schemes/featured'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different request types
  if (url.origin === location.origin) {
    // Same origin requests
    if (STATIC_ASSETS.includes(url.pathname)) {
      // Static assets - cache first
      event.respondWith(cacheFirst(request, STATIC_CACHE));
    } else if (API_ENDPOINTS.some(endpoint => url.pathname.includes(endpoint))) {
      // API requests - network first with cache fallback
      event.respondWith(networkFirst(request, API_CACHE));
    } else {
      // Other requests - network only
      event.respondWith(fetch(request));
    }
  } else {
    // Cross-origin requests - network only
    event.respondWith(fetch(request));
  }
});

// Cache first strategy
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Network first strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback for API requests
    if (request.url.includes('/api/')) {
      return new Response(
        JSON.stringify({
          error: 'Offline',
          message: 'No internet connection',
          fallback: true
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Background sync for API updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'api-sync') {
    event.waitUntil(syncApiData());
  }
});

// Sync API data when online
async function syncApiData() {
  try {
    // Sync weather data
    await fetch('/api/v1/weather?lat=19.8765&lon=75.3433');
    
    // Sync market data
    await fetch('/api/v1/market');
    
    // Sync schemes data
    await fetch('/api/v1/schemes/featured?state=maharashtra&limit=3');
    
    console.log('Service Worker: API data synced');
  } catch (error) {
    console.error('Service Worker: API sync failed:', error);
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/static/media/logo.png',
    badge: '/static/media/badge.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/static/media/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/static/media/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('AgriFuture AI', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  } else if (event.action === 'close') {
    // Just close the notification
  } else {
    // Default action - open app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
