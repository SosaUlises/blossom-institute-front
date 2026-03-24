export interface Alumno {
  id: number
  nombre: string
  apellido: string
  dni: number
  telefono?: string | null
  email: string
  activo: boolean
}

export interface CreateAlumnoDTO {
  nombre: string
  apellido: string
  dni: number
  telefono: string
  email: string
  password: string
}

export interface UpdateAlumnoDTO {
  nombre: string
  apellido: string
  dni: number
  telefono: string
  email: string
  password?: string
}

export interface StudentsListResponse {
  items: Alumno[]
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