// Vercel serverless function: POST /api/extract
import { handleExtract } from '../server/extract.js'

export default function handler(req, res) {
  return handleExtract(req, res, process.env.ANTHROPIC_API_KEY)
}
