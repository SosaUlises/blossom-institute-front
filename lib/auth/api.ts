import type { ApiResponse, LoginRequest, LoginResponseData } from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function loginRequest(payload: LoginRequest) {
  const response = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const result: ApiResponse<LoginResponseData> = await response.json()

  if (!response.ok || !result.success) {
    throw {
      statusCode: result?.statusCode ?? response.status,
      message: result?.message ?? 'Ocurrió un error al iniciar sesión',
    }
  }

  return result
}