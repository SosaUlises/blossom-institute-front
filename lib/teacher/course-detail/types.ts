export enum EstadoCurso {
  Activo = 1,
  Inactivo = 2,
  Archivado = 3,
}

export interface TeacherCourseScheduleItem {
  dia: number
  horaInicio: string
  horaFin: string
}

export interface TeacherCourseDetail {
  id: number
  nombre: string
  anio: number
  descripcion?: string | null
  estado: EstadoCurso
  horarios: TeacherCourseScheduleItem[]
  cantidadProfesores: number
  cantidadAlumnos: number
}