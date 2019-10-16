try {
  importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');

  workbox.routing.registerRoute(
    /(127.0.0.1)/,
    new workbox.strategies.NetworkFirst({
      cacheName: 'Network first'
    })
  );

  workbox.routing.registerRoute(
    /^https:\/\/(unpkg|cdn|fonts|use)/,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'CDN files',
    })
  );

} catch (e) {
  console.log('Service Worker::Network error', e);
}