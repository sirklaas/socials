import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const resolvedAnthropicKey =
    env.VITE_CLAUDE_API_KEY ||
    env.VITE_ANTHROPIC_API_KEY ||
    env.ANTHROPIC_API_KEY ||
    ''

  return {
    plugins: [react()],
    define: {
      // Standard Anthropic / skills env name works in .env; injected at build time for the client bundle.
      __PM_ANTHROPIC_API_KEY__: JSON.stringify(resolvedAnthropicKey),
    },
    server: {
      headers: {
        'Cache-Control': 'no-store',
      },
      proxy: {
        // Run `vercel dev` (default :3000) for `/api/*` during local development.
        '/api': {
          target: process.env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:3000',
          changeOrigin: true,
        },
      },
    },
  }
})
