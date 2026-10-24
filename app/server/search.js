// One Tavily web search. Shared by Partner Scout and the Advisor.
import { LLMError } from './llm.js'

export async function tavilySearch(query, env, { maxResults = 8, depth = 'basic' } = {}) {
  const key = env.TAVILY_API_KEY
  if (!key) throw new LLMError('no_search_key', 'No search provider is configured. Set TAVILY_API_KEY (free tier) on the server.', 503)
  let res
  try {
    res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ query, max_results: maxResults, search_depth: depth, include_answer: false }),
    })
  } catch {
    throw new LLMError('network', 'Could not reach the search service.')
  }
  if (res.status === 401 || res.status === 403) throw new LLMError('auth', 'The Tavily API key was rejected.')
  if (res.status === 429 || res.status === 432) throw new LLMError('rate_limit', 'Search quota reached — try again later.', 429)
  if (!res.ok) throw new LLMError('api', `Search error ${res.status}.`)
  return (await res.json()).results || []
}
