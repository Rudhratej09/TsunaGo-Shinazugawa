import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { handleExtract } from './server/extract.js'

// Serves POST /api/extract from the dev and preview servers, keeping the API key server-side.
function extractApi(apiKey) {
  // Block body on purpose: a returned function would be treated as a post-middleware hook.
  const mount = (server) => {
    server.middlewares.use('/api/extract', (req, res) => handleExtract(req, res, apiKey))
  }
  return { name: 'tsunago-extract-api', configureServer: mount, configurePreviewServer: mount }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), extractApi(env.ANTHROPIC_API_KEY)],
    build: { chunkSizeWarningLimit: 900 },
  }
})
