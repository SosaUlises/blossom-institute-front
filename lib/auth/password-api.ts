import type { ApiResponse } from './types'

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

async function readApiResponse(response: Response) {
  const rawBody = await response.text()

  try {
    return JSON.parse(rawBody) as ApiResponse<any>
  } catch {
    return {
      message: 'La respuesta del servidor no fue válida.',
      success: false,
      statusCode: response.status,
      data: null,
    } satisfies ApiResponse<any>
  }
}

export async function forgotPasswordRequest(payload: ForgotPasswordRequest) {
  const response = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const result = await readApiResponse(response)

  if (!response.ok || !result.success) {
    throw {
      statusCode: result?.statusCode ?? response.status,
      message: result?.message ?? 'No se pudo procesar la solicitud.',
    }
  }

  return result
}

export async function resetPasswordRequest(payload: ResetPasswordRequest) {
  const response = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const result = await readApiResponse(response)

  if (!response.ok || !result.success) {
    throw {
      statusCode: result?.statusCode ?? response.status,
      message: result?.message ?? 'No se pudo restablecer la contraseña.',
    }
  }

  return result
}
