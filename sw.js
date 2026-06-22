// Sinergia Familiar — Service Worker
const CACHE = 'sinergia-v5';
const OFFLINE_ASSETS = [
  '/',
  '/index_preview.html',
  '/manifest.json',
  // Tailwind CDN
  'https://cdn.tailwindcss.com',
  // Google Fonts
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(OFFLINE_ASSETS.map(url => c.add(url).catch(() => null))))
      .then(() => self.skipWaiting())
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
  if (e.request.method !== 'GET') return;
  // Never intercept AI/API calls — they need live network
  const url = e.request.url;
  if (url.includes('generativelanguage.googleapis.com')) return;
  if (url.includes('vercel.app/api')) return;

  // Cache-first for same-origin + known CDN assets; network-first for everything else
  const isCacheable = url.startsWith(self.location.origin)
    || url.includes('cdn.tailwindcss.com')
    || url.includes('fonts.googleapis.com')
    || url.includes('fonts.gstatic.com');

  if (isCacheable) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        }).catch(() => caches.match('/index_preview.html'));
      })
    );
  }
});

// Daily reminder notification
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('/'));
});

let _reminderMensajes = [];
let _reminderIdx = 0;

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SCHEDULE_REMINDER') {
    const { hour, minute, mensajes, nombres } = e.data;
    // Support both new (mensajes array) and legacy (nombres string) format
    _reminderMensajes = mensajes && mensajes.length ? mensajes : [`${nombres || 'Familia'} — tu sesión diaria te espera en Sinergia`];
    _reminderIdx = 0;

    const now  = new Date();
    const next = new Date();
    next.setHours(hour, minute, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    const delay = next - now;

    setTimeout(function fireReminder() {
      // Motivational messages with vocabulary words (#13)
      const vocabWords = ['magnificent', 'perseverance', 'eloquent', 'ambitious', 'fluent', 'diligent', 'articulate'];
      const motivMessages = [
        `Sinergia is waiting for you! Today's word: "${vocabWords[Math.floor(Math.random()*vocabWords.length)]}" — keep growing! 📚`,
        `Your English journey continues on Sinergia. Practice makes perfect! 🌟`,
        `Did you know? Just 15 minutes of English practice a day can transform your fluency! Open Sinergia now. 🚀`,
        `Sinergia challenge: Use the word "${vocabWords[Math.floor(Math.random()*vocabWords.length)]}" in a sentence today! 💬`,
      ];
      const userMsg = _reminderMensajes[_reminderIdx % _reminderMensajes.length];
      const motivMsg = motivMessages[Math.floor(Math.random()*motivMessages.length)];
      const body = userMsg + ' — ' + motivMsg;
      _reminderIdx++;
      self.registration.showNotification('Sinergia — English Practice 🇬🇧', {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'daily-reminder',
        renotify: true,
        actions: [{ action: 'open', title: 'Open Sinergia!' }]
      });
      // Re-schedule for next day
      setTimeout(fireReminder, 24 * 60 * 60 * 1000);
    }, delay);
  }
});
