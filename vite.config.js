import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Woodcraft FrameCut Pro',
        short_name: 'FrameCut',
        description: 'Precision Cabinet Face Frame & Stile/Rail Cut Calculator',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        icons: [
          {
            src: 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/ruler.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/ruler.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}']
      }
    })
  ],
});
