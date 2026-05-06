export enum EstadoCurso {
  Activo = 1,
  Inactivo = 2,
  Archivado = 3,
}

export type StudentCourseListItem = Record<string, unknown> & {
  id?: number
  cursoId?: number
  nombre?: string
  cursoNombre?: string
  anio?: number
  estado?: EstadoCurso | number
  cantidadHorarios?: number
}

export type StudentCourseDetail = StudentCourseListItem & {
  descripcion?: string | null
  cantidadProfesores?: number
  cantidadAlumnos?: number
  horarios?: unknown[] | null
}

export type StudentCoursesResponse = {
  pageNumber?: number
  pageSize?: number
  total?: number
  items: StudentCourseListItem[]
}

export type GetStudentCoursesParams = {
  pageNumber?: number
  pageSize?: number
  search?: string
  anio?: number
  estado?: number
}

export type StudentCourseSectionItem = Record<string, unknown>
