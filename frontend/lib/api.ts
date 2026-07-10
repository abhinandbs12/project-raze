// lib/api.ts
// Centralized API client for Project Raze — auto-injects enterprise API key

const API_BASE = '/api/backend'
const RAZE_KEY = process.env.NEXT_PUBLIC_RAZE_API_KEY || ''

/**
 * Authenticated fetch wrapper — injects X-Raze-API-Key on every request.
 * Use this instead of raw fetch() for all backend calls.
 */
export async function razeApi(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers || {})
  headers.set('X-Raze-API-Key', RAZE_KEY)
  headers.set('ngrok-skip-browser-warning', 'true')
  if (!headers.has('Content-Type') && options.method && options.method !== 'GET') {
    headers.set('Content-Type', 'application/json')
  }
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })
}

export { API_BASE as API }
