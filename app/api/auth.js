// Vercel serverless function: /api/auth?action=me|google|logout
import { handleAuth } from '../server/auth.js'

export default function handler(req, res) {
  return handleAuth(req, res, process.env)
}
