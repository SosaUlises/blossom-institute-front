export interface CursoAlumno {
  alumnoId: number
  nombre: string
  apellido: string
  email: string
  dni: number
}

export interface CursoProfesor {
  profesorId: number
  nombre: string
  apellido: string
  email: string
  dni: number
}

export interface CursoPeopleResponse<T> {
  items: T[]
  total: number
  pageNumber: number
  pageSize: number
}

export interface AssignAlumnosDTO {
  alumnoIds: number[]
}

export interface AssignProfesoresDTO {
  profesorIds: number[]
}