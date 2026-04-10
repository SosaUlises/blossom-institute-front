export enum EstadoCurso {
  Activo = 1,
  Inactivo = 2,
  Archivado = 3,
}

export enum EstadoClase {
  Programada = 1,
  Cancelada = 2,
}

export enum EstadoEntrega {
  EntregadaEnTermino = 1,
  FueraDeTermino = 2
}

export interface ProfesorDashboardCursoItem {
  cursoId: number
  cursoNombre: string
  anio: number
  descripcion?: string | null
  estado: EstadoCurso
}

export interface ProfesorDashboardProximaClaseItem {
  cursoId: number
  cursoNombre: string
  dia: number
  fecha: string
  horaInicio: string
  horaFin: string
}

export interface ProfesorDashboardUltimaClaseItem {
  claseId: number
  cursoId: number
  cursoNombre: string
  fecha: string
  estadoClase: EstadoClase
  descripcion?: string | null
}

export interface ProfesorDashboardUltimaEntregaItem {
  entregaId: number
  tareaId: number
  cursoId: number
  cursoNombre: string
  tituloTarea: string
  alumnoId: number
  alumnoNombre: string
  alumnoApellido: string
  fechaEntregaUtc: string
  estadoEntrega: EstadoEntrega
}

export interface ProfesorDashboardResumenCursoItem {
  cursoId: number
  cursoNombre: string
  cantidadAlumnos: number
  tareasPublicadas: number
  entregasPendientesCorreccion: number
  promedioCurso?: number | null
}

export interface ProfesorDashboardResponse {
  profesorId: number
  nombre: string
  apellido: string
  dni: number
  email?: string | null
  cantidadCursos: number
  cantidadAlumnos: number
  tareasPublicadasCount: number
  entregasPendientesCorreccionCount: number
  cursos: ProfesorDashboardCursoItem[]
  proximasClases: ProfesorDashboardProximaClaseItem[]
  ultimasClases: ProfesorDashboardUltimaClaseItem[]
  ultimasEntregas: ProfesorDashboardUltimaEntregaItem[]
  resumenPorCurso: ProfesorDashboardResumenCursoItem[]
}
