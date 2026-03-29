export enum EstadoCorreccion {
  Aprobado = 1,
  Rehacer = 2,
}

export interface CreateFeedbackPayload {
  estado: number
  nota?: number | null
  comentario?: string | null
  archivoCorregidoUrl?: string | null
  archivoCorregidoNombre?: string | null
}