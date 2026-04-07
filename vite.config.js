import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Leest .env: ANTHROPIC_API_KEY of VITE_ANTHROPIC_API_KEY — één commando: npm run dev
export default defineConfig(({ mode }) => {
  const e = loadEnv(mode, process.cwd(), '')
  const anthropicKey = (
    e.ANTHROPIC_API_KEY ||
    e.VITE_ANTHROPIC_API_KEY ||
    e.VITE_CLAUDE_API_KEY ||
    ''
  ).trim()

  return {
    plugins: [react()],
    define: {
      __PM_ANTHROPIC_KEY__: JSON.stringify(anthropicKey),
    },
    server: {
      headers: {
        'Cache-Control': 'no-store',
      },
      proxy: {
        '/api': {
          target: process.env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:3000',
          changeOrigin: true,
        },
      },
    },
  }
})
