const { offlineFallback, warmStrategyCache } = require('workbox-recipes');
const { CacheFirst } = require('workbox-strategies');
const { registerRoute } = require('workbox-routing');
const { CacheableResponsePlugin } = require('workbox-cacheable-response');
const { ExpirationPlugin } = require('workbox-expiration');
const { precacheAndRoute } = require('workbox-precaching/precacheAndRoute');

precacheAndRoute(self.__WB_MANIFEST);

// Define a custom offline fallback handler function
const offlineFallbackHandler = async ({ event }) => {
  return new Response('You are offline. Please check your internet connection.', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  });
};

// The handler function to be used as a fallback when a network request fails
offlineFallback({
  handler: offlineFallbackHandler,
});

const pageCache = new CacheFirst({
  cacheName: 'page-cache',
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
      maxAgeSeconds: 30 * 24 * 60 * 60,
    }),
  ],
});

warmStrategyCache({
  urls: ['/index.html', '/'],
  strategy: pageCache,
});

registerRoute(
  // Match all requests for assets (e.g., CSS, JS, images)
  ({ request }) => request.destination === 'style' || request.destination === 'script' || request.destination === 'image',
  // Use a CacheFirst strategy for assets, cache them for 30 days
  new CacheFirst({
    cacheName: 'asset-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

registerRoute();

