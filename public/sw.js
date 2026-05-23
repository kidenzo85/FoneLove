// ============================================================
// ConnectPhone Service Worker - Advanced Caching Strategies
// Version: 2.0.0
// ============================================================

const CACHE_NAME = 'connectphone-v2';
const STATIC_CACHE = 'connectphone-static-v2';
const DYNAMIC_CACHE = 'connectphone-dynamic-v2';
const IMAGE_CACHE = 'connectphone-images-v2';
const API_CACHE = 'connectphone-api-v2';

// Assets to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
  '/logo.svg',
  '/favicon.ico',
];

// Max entries for dynamic caches
const MAX_DYNAMIC_ENTRIES = 50;
const MAX_IMAGE_ENTRIES = 100;
const MAX_API_ENTRIES = 30;

// Cache expiration utility
async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    // Delete oldest entries (FIFO)
    const deleteCount = keys.length - maxEntries;
    for (let i = 0; i < deleteCount; i++) {
      await cache.delete(keys[i]);
    }
  }
}

// ============================================================
// INSTALL EVENT - Pre-cache critical assets
// ============================================================
self.addEventListener('install', (event) => {
  console.log('[SW] Install v2.0.0');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Pre-caching static assets');
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('[SW] Some pre-cache URLs failed:', err);
        // Don't fail install if some URLs are unavailable
        return Promise.resolve();
      });
    })
  );
  // Activate immediately without waiting
  self.skipWaiting();
});

// ============================================================
// ACTIVATE EVENT - Clean up old caches
// ============================================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate v2.0.0');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            // Delete old versions of our caches
            return (
              name.startsWith('connectphone-') &&
              name !== STATIC_CACHE &&
              name !== DYNAMIC_CACHE &&
              name !== IMAGE_CACHE &&
              name !== API_CACHE
            );
          })
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// ============================================================
// FETCH EVENT - Advanced routing strategies
// ============================================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) return;

  // Route to appropriate strategy
  if (isApiRequest(url)) {
    // Never cache write endpoints — always go to network directly
    if (isUncacheableApi(url)) {
      return; // Let browser handle it natively
    }
    event.respondWith(networkFirstWithFallback(request, API_CACHE, 15));
  } else if (isImageRequest(url, request)) {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
  } else if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (isNavigationRequest(request)) {
    event.respondWith(navigationStrategy(request));
  } else {
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
  }
});

// ============================================================
// STRATEGY: Cache First - For static assets that rarely change
// ============================================================
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return offline fallback for images
    if (request.destination === 'image') {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect fill="#0a0a12" width="400" height="400"/><text fill="#333" font-family="sans-serif" font-size="14" x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">ConnectPhone</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// ============================================================
// STRATEGY: Network First - For API calls that need fresh data
// ============================================================
async function networkFirstWithFallback(request, cacheName, timeoutMs = 5) {
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Network timeout')), timeoutMs * 1000)
    );

    const response = await Promise.race([
      fetch(request),
      timeoutPromise,
    ]);

    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      await trimCache(cacheName, MAX_API_ENTRIES);
    }
    return response;
  } catch (error) {
    // Fallback to cache
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Return offline response for API
    return new Response(
      JSON.stringify({ error: 'offline', message: 'Pas de connexion internet' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// ============================================================
// STRATEGY: Stale While Revalidate - For images and non-critical resources
// ============================================================
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  // Return cached immediately if available, otherwise wait for network
  if (cached) {
    // Update cache in background
    fetchPromise.catch(() => {});
    return cached;
  }

  try {
    return await fetchPromise;
  } catch (error) {
    if (request.destination === 'image') {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect fill="#0a0a12" width="400" height="400"/><text fill="#333" font-family="sans-serif" font-size="14" x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">ConnectPhone</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    return new Response('Offline', { status: 503 });
  }
}

// ============================================================
// STRATEGY: Navigation - App shell with offline fallback
// ============================================================
async function navigationStrategy(request) {
  try {
    // Try network first for navigation
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Check cache first
    const cached = await caches.match(request);
    if (cached) return cached;

    // Return cached app shell (homepage) as fallback
    const shell = await caches.match('/');
    if (shell) return shell;

    // Ultimate offline fallback page
    return new Response(getOfflinePage(), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function isApiRequest(url) {
  return url.pathname.startsWith('/api/');
}

// Routes that must NEVER be served from cache (payments, auth writes, credits)
function isUncacheableApi(url) {
  const p = url.pathname;
  return (
    p.startsWith('/api/payments/') ||
    p.startsWith('/api/credits/spend') ||
    p.startsWith('/api/credits/daily-free') ||
    p.startsWith('/api/credits/streak') ||
    p.startsWith('/api/fonelove/send') ||
    p.startsWith('/api/fonelove/recharge') ||
    p.startsWith('/api/fonelove/withdraw') ||
    p.startsWith('/api/auth/')
  );
}

function isImageRequest(url, request) {
  return (
    request.destination === 'image' ||
    url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i) ||
    url.hostname.includes('pravatar.cc') ||
    url.hostname.includes('imgbb')
  );
}

function isStaticAsset(url) {
  return (
    url.pathname.match(/\.(js|css|woff2?|ttf|eot)$/i) ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/logo.svg' ||
    url.pathname === '/favicon.ico' ||
    url.pathname === '/manifest.json'
  );
}

function isNavigationRequest(request) {
  return (
    request.mode === 'navigate' ||
    (request.method === 'GET' &&
      request.headers.get('accept')?.includes('text/html'))
  );
}

function getOfflinePage() {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ConnectPhone - Hors ligne</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0a0a12;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 2rem;
    }
    .container {
      text-align: center;
      max-width: 320px;
    }
    .icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 1.5rem;
      background: linear-gradient(135deg, #ec4899, #f43f5e);
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 32px rgba(236, 72, 153, 0.3);
    }
    .icon svg { width: 40px; height: 40px; fill: white; }
    h1 {
      font-size: 1.5rem;
      font-weight: 800;
      margin-bottom: 0.5rem;
    }
    p {
      font-size: 0.875rem;
      color: rgba(255,255,255,0.5);
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }
    .pulse {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #ef4444;
      margin: 0 auto 1rem;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.3); opacity: 0.5; }
    }
    .retry-btn {
      background: linear-gradient(90deg, #ec4899, #f43f5e);
      color: white;
      border: none;
      padding: 0.875rem 2rem;
      border-radius: 16px;
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .retry-btn:active { transform: scale(0.96); }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">
      <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
    </div>
    <div class="pulse"></div>
    <h1>Tu es hors ligne</h1>
    <p>Vérifie ta connexion internet et réessaie. ConnectPhone a besoin d'une connexion pour fonctionner.</p>
    <button class="retry-btn" onclick="window.location.reload()">Réessayer</button>
  </div>
</body>
</html>`;
}

// ============================================================
// PUSH NOTIFICATION HANDLER
// ============================================================
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    
    // Notification type icons
    const typeIcons = {
      match: '/icons/icon-192x192.png',
      message: '/icons/icon-192x192.png',
      request: '/icons/icon-192x192.png',
      marketing: '/icons/icon-192x192.png',
      alert: '/icons/icon-192x192.png',
      info: '/icons/icon-192x192.png',
      connection: '/icons/icon-192x192.png',
      streak: '/icons/icon-192x192.png',
      challenge: '/icons/icon-192x192.png',
      promo: '/icons/icon-192x192.png',
    };
    
    // Notification type vibration patterns
    const vibrationPatterns = {
      match: [100, 50, 100, 50, 100],
      message: [100, 50, 100],
      request: [200, 100, 200],
      marketing: [100],
      alert: [200, 100, 200, 100, 200],
      info: [100],
    };

    const notifType = data.type || 'info';
    const options = {
      body: data.body || 'Nouvelle activité sur ConnectPhone',
      icon: typeIcons[notifType] || '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      image: data.image || undefined,
      vibrate: vibrationPatterns[notifType] || [100, 50, 100],
      data: {
        url: data.url || '/',
        type: notifType,
        campaignId: data.campaignId || null,
        timestamp: Date.now(),
      },
      actions: data.actions || getDefaultActions(notifType),
      tag: data.tag || `connectphone-${notifType}`,
      renotify: true,
      requireInteraction: notifType === 'request' || notifType === 'alert',
    };

    event.waitUntil(
      self.registration.showNotification(
        data.title || 'ConnectPhone',
        options
      )
    );
  } catch (error) {
    console.error('[SW] Push notification error:', error);
  }
});

// Get default actions based on notification type
function getDefaultActions(type) {
  switch (type) {
    case 'match':
      return [
        { action: 'open', title: 'Voir le match' },
        { action: 'dismiss', title: 'Plus tard' },
      ];
    case 'message':
      return [
        { action: 'reply', title: 'Répondre' },
        { action: 'open', title: 'Ouvrir' },
      ];
    case 'request':
      return [
        { action: 'accept', title: 'Accepter' },
        { action: 'dismiss', title: 'Refuser' },
      ];
    case 'marketing':
      return [
        { action: 'open', title: 'En savoir plus' },
        { action: 'dismiss', title: 'Ignorer' },
      ];
    default:
      return [
        { action: 'open', title: 'Ouvrir' },
        { action: 'dismiss', title: 'Ignorer' },
      ];
  }
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const notifData = event.notification.data || {};
  const action = event.action;
  
  // Determine URL based on action and notification type
  let urlToOpen = notifData.url || '/';
  
  if (action === 'dismiss') return;
  
  if (action === 'accept' && notifData.type === 'request') {
    urlToOpen = '/?tab=requests&action=accept';
  } else if (action === 'reply' && notifData.type === 'message') {
    urlToOpen = '/?tab=messages';
  } else if (action === 'open' || !action) {
    // Use the URL from notification data
    urlToOpen = notifData.url || '/';
  }
  
  // Report click to server (fire and forget)
  if (notifData.campaignId) {
    fetch('/api/notifications/campaigns', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId: notifData.campaignId, clickAction: action }),
    }).catch(() => {});
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // Open new window
      return self.clients.openWindow(urlToOpen);
    })
  );
});

// ============================================================
// BACKGROUND SYNC (when supported)
// ============================================================
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-requests') {
    event.waitUntil(syncPendingRequests());
  }
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncPendingMessages());
  }
});

async function syncPendingRequests() {
  // In a real app, this would read from IndexedDB and retry failed requests
  console.log('[SW] Syncing pending requests...');
}

async function syncPendingMessages() {
  // In a real app, this would read from IndexedDB and retry failed messages
  console.log('[SW] Syncing pending messages...');
}

// ============================================================
// PERIODIC BACKGROUND SYNC (when supported)
// ============================================================
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-content') {
    event.waitUntil(updateContentInBackground());
  }
});

async function updateContentInBackground() {
  // Pre-cache updated content
  const cache = await caches.open(DYNAMIC_CACHE);
  try {
    await cache.add('/');
  } catch (error) {
    console.log('[SW] Background content update failed');
  }
}
