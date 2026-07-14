/// <reference lib="webworker" />
/* global ServiceWorkerGlobalScope */

const sw = /** @type {ServiceWorkerGlobalScope} */ (self)
const CACHE = 'decoding-v6-1'
const CORE = ['/', '/tools/', '/privacy/', '/methodology/', '/manifest.webmanifest', '/favicon.svg']

sw.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)))
  sw.skipWaiting()
})

sw.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      ),
  )
  sw.clients.claim()
})

sw.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== sw.location.origin)
    return
  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ??
        fetch(event.request)
          .then((response) => {
            if (response.ok) {
              const copy = response.clone()
              caches.open(CACHE).then((cache) => cache.put(event.request, copy))
            }
            return response
          })
          .catch(() => caches.match('/404/')),
    ),
  )
})
