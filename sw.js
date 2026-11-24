/* Minimal service worker: makes the site installable. It never caches, so GitHub updates show immediately. */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',()=>{});
