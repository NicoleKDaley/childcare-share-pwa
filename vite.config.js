import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Childcare Share App',
        short_name: 'ChildcareShare',
        description: 'A PWA to coordinate childcare pickups and schedules',
        theme_color: '#317EFB',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'firestore-cache',
            }
          },
          {
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'storage-cache',
            }
          }
        ]
      }
    })
  ]
})