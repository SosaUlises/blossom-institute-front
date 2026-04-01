export enum EstadoCorreccion {
  Aprobado = 1,
  Rehacer = 2,
}

export type CreateFeedbackAttachmentPayload = {
  tipo: number
  url: string
  nombre?: string | null
  storageProvider?: number | null
  storageKey?: string | null
  contentType?: string | null
  sizeBytes?: number | null
}

export type CreateFeedbackPayload = {
  estado: number
  nota?: number | null
  comentario?: string | null
  adjuntos: CreateFeedbackAttachmentPayload[]
}