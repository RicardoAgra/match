try {
  importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');

  workbox.routing.registerRoute(
    /https\:\/\/ricardoagra.github.io\/match/,
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