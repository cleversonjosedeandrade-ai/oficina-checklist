const CACHE_NAME = 'oficina-v2';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png'
];

// Instalar e cachear arquivos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Ativar e limpar caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch handler — responde com cache, busca na rede se não tiver
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Se encontrou no cache, retorna do cache
      if (response) {
        return response;
      }
      // Se não, busca na rede
      return fetch(event.request).then(networkResponse => {
        // Se recebeu resposta válida, guarda no cache
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === 'basic'
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      });
    }).catch(() => {
      // Se falhar tudo, tenta retornar o index.html do cache
      return caches.match('./index.html');
    })
  );
});
