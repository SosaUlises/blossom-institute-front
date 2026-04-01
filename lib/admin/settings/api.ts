import type {
  ChangeMyPasswordDTO,
  MyAccountSettings,
  UpdateMyAccountSettingsDTO,
} from './types'

async function safeJson(response: Response) {
  const text = await response.text()

  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return { raw: text }
  }
}

function extractErrorMessage(result: any, fallback: string) {
  if (!result) return fallback

  if (typeof result.message === 'string' && result.message.trim()) {
    return result.message
  }

  if (Array.isArray(result.message) && result.message.length > 0) {
    return result.message.join(', ')
  }

  if (Array.isArray(result.data) && result.data.length > 0) {
    return result.data
      .map((x: any) => x?.errorMessage || x?.message || x?.description || String(x))
      .join(', ')
  }

  if (Array.isArray(result.errors) && result.errors.length > 0) {
    return result.errors
      .map((x: any) => x?.errorMessage || x?.message || x?.description || String(x))
      .join(', ')
  }

  if (typeof result.raw === 'string' && result.raw.trim()) {
    return result.raw
  }

  return fallback
}

async function parseResponse<T>(response: Response): Promise<T> {
  const result = await safeJson(response)

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(result, 'Ocurrió un error en la solicitud.')
    )
  }

  return (result?.data ?? null) as T
}

export async function getMyAccountSettings(): Promise<MyAccountSettings> {
  const response = await fetch('/api/admin/settings/account', {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  })

  return parseResponse<MyAccountSettings>(response)
}

export async function updateMyAccountSettings(
  payload: UpdateMyAccountSettingsDTO
): Promise<MyAccountSettings> {
  const response = await fetch('/api/admin/settings/account', {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return parseResponse<MyAccountSettings>(response)
}

export async function changeMyPassword(
  payload: ChangeMyPasswordDTO
): Promise<string> {
  const response = await fetch('/api/admin/settings/account/change-password', {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const result = await safeJson(response)

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(result, 'No se pudo actualizar la contraseña.')
    )
  }

  return result?.data || result?.message || 'La contraseña fue actualizada correctamente.'
}