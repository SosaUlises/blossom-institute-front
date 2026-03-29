export enum EstadoAsistencia {
  Presente = 1,
  Ausente = 2,
}

export enum EstadoClase {
  Programada = 1,
  Cancelada = 2,
}

export interface AttendanceStudentItem {
  alumnoId: number
  nombreCompleto: string
  estado?: EstadoAsistencia | null
}

export interface ClassAttendanceDetail {
  claseId: number
  cursoId: number
  fecha: string
  estadoClase: EstadoClase
  descripcion?: string | null
  alumnos: AttendanceStudentItem[]
}

export interface SaveAttendanceItem {
  alumnoId: number
  estado: EstadoAsistencia
}

export interface SaveAttendancePayload {
  descripcionClase?: string
  asistencias: SaveAttendanceItem[]
}