// Vercel serverless function: /api/scout?action=status|plan|search|read|draft
import { handleScout } from '../server/scout.js'

export default function handler(req, res) {
  return handleScout(req, res, process.env)
}
