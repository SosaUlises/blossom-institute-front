export enum EstadoCurso {
  Activo = 1,
  Inactivo = 2,
  Archivado = 3,
}

export interface TeacherCourseListItem {
  id: number
  nombre: string
  anio: number
  estado: EstadoCurso
  cantidadHorarios: number
}

export interface TeacherCoursesResponse {
  pageNumber: number
  pageSize: number
  total: number
  items: TeacherCourseListItem[]
}