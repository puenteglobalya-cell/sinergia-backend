// Sinergia Familiar — Service Worker
const CACHE = 'sinergia-v1';
const OFFLINE_ASSETS = ['/'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(OFFLINE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Only cache same-origin GET requests (not Gemini API calls)
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('generativelanguage.googleapis.com')) return;
  if (e.request.url.includes('vercel.app/api')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => caches.match('/'));
    })
  );
});

// Daily reminder notification
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('/'));
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SCHEDULE_REMINDER') {
    const { hour, minute, nombres } = e.data;
    // Calculate ms until next occurrence
    const now  = new Date();
    const next = new Date();
    next.setHours(hour, minute, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    const delay = next - now;
    setTimeout(() => {
      self.registration.showNotification('¡Hora de practicar inglés! 🌍', {
        body: `${nombres} — tu sesión diaria te espera en Sinergia`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'daily-reminder',
        renotify: true,
        actions: [{ action: 'open', title: '¡Vamos!' }]
      });
    }, delay);
  }
});
