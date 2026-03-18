import type { ApiResponse } from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export interface ForgotPasswordRequest {
  email: string
  frontendResetUrl: string
}

export interface ResetPasswordRequest {
  email: string
  token: string
  newPassword: string
  confirmPassword: string
}

export async function forgotPasswordRequest(payload: ForgotPasswordRequest) {
  const response = await fetch(`${API_URL}/api/v1/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const result: ApiResponse<any> = await response.json()

  if (!response.ok || !result.success) {
    throw {
      statusCode: result?.statusCode ?? response.status,
      message: result?.message ?? 'No se pudo procesar la solicitud.',
    }
  }

  return result
}

export async function resetPasswordRequest(payload: ResetPasswordRequest) {
  const response = await fetch(`${API_URL}/api/v1/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const result: ApiResponse<any> = await response.json()

  if (!response.ok || !result.success) {
    throw {
      statusCode: result?.statusCode ?? response.status,
      message: result?.message ?? 'No se pudo restablecer la contraseña.',
    }
  }

  return result
}