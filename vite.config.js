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

  const buildRef = (
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.CF_PAGES_COMMIT_SHA ||
    ''
  ).trim()

  return {
    plugins: [react()],
    define: {
      __PM_ANTHROPIC_KEY__: JSON.stringify(anthropicKey),
      /** Shown in UI so production matches repo (Vercel injects VERCEL_GIT_COMMIT_SHA on build) */
      __BUILD_REF__: JSON.stringify(buildRef || 'dev'),
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
