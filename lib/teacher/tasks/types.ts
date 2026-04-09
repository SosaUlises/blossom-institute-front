export enum EstadoTarea {
  Borrador = 1,
  Publicada = 2,
  Archivada = 3,
}

export enum EstadoEntrega {
  EntregadaEnTermino = 1,
  FueraDeTermino = 2,
}

export enum EstadoCorreccion {
  Aprobado = 1,
  Rehacer = 2,
}

export enum TipoAdjunto {
  Link = 1,
  Archivo = 2,
}

export interface TeacherTaskListResponse {
  total: number
  pageNumber: number
  pageSize: number
  items: TeacherTaskListItem[]
}

export interface TeacherTaskResourceItem {
  id: number
  tipo: number
  url: string
  nombre: string
}


export interface TeacherFeedbackCurrent {
  feedbackId: number
  estado: number
  nota?: number | null
  fechaCorreccionUtc: string
}

export interface TeacherSubmissionListItem {
  entregaId: number
  alumnoId: number
  alumnoNombre: string
  alumnoApellido: string
  alumnoDni: number
  fechaEntregaUtc: string
  estadoEntrega: number
  tieneAdjuntos: boolean
  feedbackVigente?: TeacherFeedbackCurrent | null
}
export interface TeacherFeedbackCurrent {
  feedbackId: number
  estado: number
  nota?: number | null
  fechaCorreccionUtc: string
}

export interface TeacherSubmissionListItem {
  entregaId: number
  alumnoId: number
  alumnoNombre: string
  alumnoApellido: string
  alumnoDni: number

  fechaEntregaUtc: string
  estadoEntrega: number
  tieneAdjuntos: boolean

  feedbackVigente?: TeacherFeedbackCurrent | null
}

export interface TeacherSubmissionsResponse {
  total: number
  pageNumber: number
  pageSize: number
  items: TeacherSubmissionListItem[]
}

export interface TeacherSubmissionAttachment {
  id: number
  url: string
  nombre: string
  tipo: number
}

export interface TeacherFeedbackHistoryItem {
  feedbackId: number
  esVigente: boolean
  estado: number
  nota?: number | null
  comentario?: string | null
  fechaCorreccionUtc: string
  archivoCorregidoUrl?: string | null
  archivoCorregidoNombre?: string | null
}

export interface TeacherSubmissionDetail {
  alumnoNombre: string
  alumnoApellido: string
  entregaId: number
  tareaId: number
  alumnoId: number
  texto?: string | null
  fechaEntregaUtc: string
  estadoEntrega: number
  adjuntos: TeacherSubmissionAttachment[]
  feedbackVigente?: TeacherFeedbackCurrent | null
  feedbackHistorial: TeacherFeedbackHistoryItem[]
}

export interface TeacherTaskUpdateResourceInput {
  tipo: number
  url?: string | null
  nombre?: string | null
  storageProvider?: number | null
  storageKey?: string | null
  contentType?: string | null
  sizeBytes?: number | null
}

export interface TeacherTaskUpdatePayload {
  titulo: string
  consigna?: string | null
  fechaEntregaUtc?: string | null
  estado: number
  recursos: TeacherTaskUpdateResourceInput[]
}


export type TeacherFeedbackAdjunto = {
  id: number
  tipo: number
  url: string
  nombre?: string | null
  storageProvider?: number | null
  storageKey?: string | null
  contentType?: string | null
  sizeBytes?: number | null
}

export type TeacherSubmissionFeedbackItem = {
  feedbackId: number
  esVigente: boolean
  estado: number
  nota?: number | null
  comentario?: string | null
  fechaCorreccionUtc: string
  adjuntos: TeacherFeedbackAdjunto[]
}

export type TeacherSubmissionFeedbacksResponse = {
  entregaId: number
  total: number
  calificacionActual?: {
    id: number
    tipo: number
    titulo: string
    nota?: number | null
    fecha: string
  } | null
  items: TeacherSubmissionFeedbackItem[]
}


export interface TeacherTaskListItem {
  id: number
  cursoId: number
  profesorId: number
  titulo: string
  estado: number
  fechaEntregaUtc: string | null
  esAnuncio: boolean
  createdAtUtc: string
}

export interface TeacherTaskDetailResource {
  id: number
  tipo: number
  url: string
  nombre?: string | null
  storageProvider?: number | null
  storageKey?: string | null
  contentType?: string | null
  sizeBytes?: number | null
}

export interface TeacherTaskDetail {
  id: number
  cursoId: number
  profesorId: number
  titulo: string
  consigna?: string | null
  estado: number
  fechaEntregaUtc: string | null
  esAnuncio: boolean
  createdAtUtc: string
  updatedAtUtc?: string | null
  recursos: TeacherTaskDetailResource[]
}