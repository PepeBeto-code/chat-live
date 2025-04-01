self.addEventListener('install', event => {
    console.log('Service Worker instalado.');
  });
  
self.addEventListener('activate', event => {
    console.log('Service Worker activado.');
  });

self.addEventListener("push", function (event) {
    const data = event.data.json();
    event.waitUntil(self.registration.showNotification(data.title, {
      body: data.message,
      icon: data.icon,
    }));
  });