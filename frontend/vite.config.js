import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173, // ganti port dev server (jika ingin seragam)
    allowedHosts: ['wolf-supreme-grouse.ngrok-free.app', 'raven-thorough-marginally.ngrok-free.app'],
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/api/, ''),
      }
    }
  },
  preview: {
    port: 4173,              // Mengatur port untuk preview
    strictPort: true,        // Pastikan tidak auto pindah ke port lain
    allowedHosts: ['wolf-supreme-grouse.ngrok-free.app', 'raven-thorough-marginally.ngrok-free.app'],
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/api/, ''),
      }
    }
  }
})
