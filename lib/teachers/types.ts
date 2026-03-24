export interface Profesor {
  id: number
  nombre: string
  apellido: string
  dni: number
  telefono?: string | null
  email: string
  activo: boolean
}

export interface CreateProfesorDTO {
  nombre: string
  apellido: string
  dni: number
  telefono: string
  email: string
  password: string
}

export interface UpdateProfesorDTO {
  nombre: string
  apellido: string
  dni: number
  telefono: string
  email: string
  password?: string
}

export interface TeachersListResponse {
  items: Profesor[]
  total: number
  pageNumber: number
  pageSize: number
}

export interface ApiResponse<T> {
  message: string
  success: boolean
  statusCode: number
  data: T
}