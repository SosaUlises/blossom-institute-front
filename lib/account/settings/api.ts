import type {
  ChangePasswordDTO,
  MyAccountSettings,
  UpdateAvatarResponse,
  UpdateMyAccountSettingsDTO,
} from './types'
import { parseApiData, parseApiMessage } from './types'

async function readJson(response: Response) {
  const text = await response.text()

  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return { raw: text }
  }
}

export async function getMyAccountSettings(): Promise<MyAccountSettings> {
  const response = await fetch('/api/settings/account', {
    method: 'GET',
    cache: 'no-store',
  })

  const result = await readJson(response)

  if (!response.ok) {
    throw new Error(
      parseApiMessage(result, 'No se pudo obtener la configuración de la cuenta.'),
    )
  }

  return parseApiData<MyAccountSettings>(result)
}

export async function updateMyAccountSettings(
  payload: UpdateMyAccountSettingsDTO,
): Promise<MyAccountSettings> {
  const response = await fetch('/api/settings/account', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const result = await readJson(response)

  if (!response.ok) {
    throw new Error(
      parseApiMessage(result, 'No se pudo actualizar la información de la cuenta.'),
    )
  }

  return parseApiData<MyAccountSettings>(result)
}

export async function changeMyPassword(
  payload: ChangePasswordDTO,
): Promise<string> {
  const response = await fetch('/api/settings/account/change-password', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const result = await readJson(response)

  if (!response.ok) {
    throw new Error(
      parseApiMessage(result, 'No se pudo actualizar la contraseña.'),
    )
  }

  return parseApiMessage(result, 'Contraseña actualizada correctamente.')
}

export async function updateMyAvatar(file: File): Promise<UpdateAvatarResponse> {
  const formData = new FormData()
  formData.append('File', file)

  const response = await fetch('/api/settings/account/avatar', {
    method: 'PUT',
    body: formData,
  })

  const result = await readJson(response)

  if (!response.ok) {
    throw new Error(
      parseApiMessage(result, 'No pudimos actualizar tu foto.'),
    )
  }

  return parseApiData<UpdateAvatarResponse>(result)
}

export async function deleteMyAvatar(): Promise<void> {
  const response = await fetch('/api/settings/account/avatar', {
    method: 'DELETE',
  })

  const result = await readJson(response)

  if (!response.ok) {
    throw new Error(
      parseApiMessage(result, 'No pudimos eliminar tu foto.'),
    )
  }
}
