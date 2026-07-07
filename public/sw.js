// Minimal service worker — enables PWA installability (Phase 1).
// No caching strategy yet; offline support is a Phase 2 task.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))
