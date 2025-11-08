self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('savings-cache-v1').then((cache) => {
        return cache.addAll([
          './',
          './index.html',
          './manifest.json',
          './icons/savings.png',
          './icons/savings.png'
        ]);
      })
    );
    console.log('✅ Service Worker installed');
  });
  
  self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
    );
  });
  