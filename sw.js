const CACHE_NAME = 'instaindir-v5';
const STATIC_ASSETS = [
  '/instaindir/',
  '/instaindir/index.html',
  '/instaindir/style.css',
  '/instaindir/app.js',
  '/instaindir/manifest.json',
  '/instaindir/icons/icon-192.png',
  '/instaindir/icons/icon-512.png',
];

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
