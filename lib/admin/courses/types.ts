export enum EstadoCurso {
  Activo = 1,
  Inactivo = 2,
  Archivado = 3,
}

export interface CursoHorario {
  dia: number
  horaInicio: string
  horaFin: string
}

export interface CursoListItem {
  id: number
  nombre: string
  anio: number
  estado: EstadoCurso
  cantidadHorarios: number
  cantidadProfesores: number
  cantidadAlumnos: number
}

export interface CursoById {
  id: number
  nombre: string
  anio: number
  descripcion?: string | null
  estado: EstadoCurso
  horarios: CursoHorario[]
  cantidadProfesores: number
  cantidadAlumnos: number
}

export interface CreateCursoDTO {
  nombre: string
  anio: number
  descripcion?: string
  estado: number
  horarios: CursoHorario[]
}

export interface UpdateCursoDTO {
  nombre: string
  anio: number
  descripcion?: string
  estado: number
  horarios: CursoHorario[]
}

export interface CoursesListResponse {
  items: CursoListItem[]
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