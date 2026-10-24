// Vercel serverless function: POST /api/culture?action=coach|negotiate
import { handleCulture } from '../server/culture.js'

export default function handler(req, res) {
  return handleCulture(req, res, process.env)
}
