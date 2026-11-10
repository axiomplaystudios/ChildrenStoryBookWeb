import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
  base: './',
  plugins: [VitePWA({
    registerType: 'prompt', injectRegister: false,
    includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png'],
    manifest: {
      name: 'Bedtime Bookshelf', short_name: 'Bookshelf', description: 'Read, wonder, and wind down together.',
      theme_color: '#172e35', background_color: '#f7f3e9', display: 'standalone', start_url: './', scope: './',
      icons: [{ src: 'icon-192.png', sizes: '192x192', type: 'image/png' }, { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' }],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,png,webp,jpg,json,webmanifest}'],
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      cleanupOutdatedCaches: true, clientsClaim: true,
      navigateFallback: 'index.html',
    },
    devOptions: { enabled: false },
  })],
});
