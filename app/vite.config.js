import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { handleExtract } from './server/extract.js'
import { handleScout } from './server/scout.js'
import { handleAuth } from './server/auth.js'
import { handleAdvisor } from './server/advisor.js'

// Serves the /api routes from the dev and preview servers, keeping API keys server-side.
// On Vercel the same handlers run as functions from app/api/.
function apiRoutes(env) {
  // Block body on purpose: a returned function would be treated as a post-middleware hook.
  const mount = (server) => {
    server.middlewares.use('/api/extract', (req, res) => handleExtract(req, res, env))
    server.middlewares.use('/api/scout', (req, res) => handleScout(req, res, env))
    server.middlewares.use('/api/auth', (req, res) => handleAuth(req, res, env))
    server.middlewares.use('/api/advisor', (req, res) => handleAdvisor(req, res, env))
  }
  return { name: 'tsunago-api', configureServer: mount, configurePreviewServer: mount }
}

export default defineConfig(({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') }
  return {
    plugins: [react(), apiRoutes(env)],
    build: { chunkSizeWarningLimit: 900 },
  }
})
