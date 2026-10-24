// Vercel serverless function: POST /api/advisor
import { handleAdvisor } from '../server/advisor.js'

export default function handler(req, res) {
  return handleAdvisor(req, res, process.env)
}
