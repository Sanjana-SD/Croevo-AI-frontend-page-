import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env vars (without VITE_ prefix) so they stay server-side only
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Proxy /api/v2/generate-game → Google Gemini AI
        '/api/v2/generate-game': {
          target: 'https://generativelanguage.googleapis.com',
          changeOrigin: true,
          rewrite: (path) => `/v1/models/gemini-1.5-flash:generateContent?key=${env.GOOGLE_GEMINI_API_KEY}`,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              console.log('Proxying request to:', proxyReq.path);
            });
          }
        }
      }
    }
  }
})
