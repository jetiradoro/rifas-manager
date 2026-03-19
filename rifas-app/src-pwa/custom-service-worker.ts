/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.config file > pwa > workboxMode is set to "InjectManifest"
 */

/// <reference lib="WebWorker" />
declare const self: ServiceWorkerGlobalScope & typeof globalThis;

import { clientsClaim } from 'workbox-core';
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
} from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';

// Ensure the new SW activates immediately
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

// Take control of uncontrolled clients as soon as possible
self.addEventListener('activate', (event) => {
  event.waitUntil(Promise.resolve(clientsClaim()));
});

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST);

cleanupOutdatedCaches();

// Non-SSR fallbacks to index.html
// Production SSR fallbacks to offline.html (except for dev)
if (process.env.MODE !== 'ssr' || process.env.PROD) {
  registerRoute(
    new NavigationRoute(createHandlerBoundToURL(process.env.PWA_FALLBACK_HTML), {
      denylist: [new RegExp(process.env.PWA_SERVICE_WORKER_REGEX), /workbox-(.)*\.js$/],
    }),
  );
}
