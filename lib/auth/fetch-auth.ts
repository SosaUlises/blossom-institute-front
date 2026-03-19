import { getToken, clearAuthSession } from './storage'

export async function fetchWithAuth(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = getToken()

  const headers = new Headers(init.headers || {})
  headers.set('Content-Type', 'application/json')

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(input, {
    ...init,
    headers,
  })

  if (response.status === 401 || response.status === 403) {
    clearAuthSession()
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  return response
}