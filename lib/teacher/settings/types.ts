export type MyAccountSettings = {
  id: number
  nombre: string
  apellido: string
  email: string
  telefono?: string | null
  dni: number
  activo: boolean
  roles: string[]
}

export type UpdateMyAccountSettingsDTO = {
  nombre: string
  apellido: string
  email: string
  telefono?: string | null
  dni: number
}

export type ChangePasswordDTO = {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

type ApiEnvelope<T> = {
  success?: boolean
  statusCode?: number
  message?: string
  data?: T
}

export function parseApiData<T>(result: ApiEnvelope<T> | T): T {
  return ((result as ApiEnvelope<T>)?.data ?? result) as T
}

export function parseApiMessage(result: unknown, fallback: string) {
  if (
    result &&
    typeof result === 'object' &&
    'message' in result &&
    typeof (result as { message?: unknown }).message === 'string'
  ) {
    return (result as { message: string }).message
  }

  return fallback
}