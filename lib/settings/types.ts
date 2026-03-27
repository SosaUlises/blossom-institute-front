export interface MyAccountSettings {
  id: number
  nombre: string
  apellido: string
  email: string
  telefono?: string | null
  dni: number
  activo: boolean
  roles: string[]
}

export interface UpdateMyAccountSettingsDTO {
  nombre: string
  apellido: string
  email: string
  telefono?: string | null
  dni: number
}

export interface ChangeMyPasswordDTO {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}