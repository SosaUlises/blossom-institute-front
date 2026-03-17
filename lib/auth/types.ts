export interface LoginRequest {
  email: string
  password: string
}

export interface AuthUser {
  id: number
  email: string
  nombre: string
  apellido: string
  roles: string[]
}

export interface LoginResponseData {
  token: string
  usuario: AuthUser
}

export interface ApiResponse<T> {
  message: string
  success: boolean
  statusCode: number
  data: T
}