/* Letter Zoo offline cache: network first, falls back to the saved copy (classrooms with weak Wi-Fi). */
var CACHE = 'letterzoo-v2';
var ASSETS = ['/', '/index.html', '/style.css', '/app.js', '/letters.js', '/design-theme.js', '/icon.svg', '/manifest.webmanifest'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  var mine = url.origin === self.location.origin;
  var fonts = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!mine && !fonts) return;
  if (mine && url.pathname.indexOf('/api/') === 0) return; // live numbers and voice clips come straight from the server
  e.respondWith(
    fetch(e.request).then(function (r) {
      if (r && (r.ok || r.type === 'opaque')) {
        var copy = r.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      }
      return r;
    }).catch(function () {
      return caches.match(e.request).then(function (m) { return m || (mine ? caches.match('/index.html') : undefined); });
    })
  );
});
