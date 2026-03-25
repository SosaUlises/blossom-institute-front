export enum EstadoTarea {
  Borrador = 1,
  Publicada = 2,
  Archivada = 3,
}

export interface CursoTareaListItem {
  id: number
  cursoId: number
  profesorId: number
  titulo: string
  estado: EstadoTarea
  fechaEntregaUtc?: string | null
  createdAtUtc: string
}

export interface CursoTareasResponse {
  total: number
  pageNumber: number
  pageSize: number
  items: CursoTareaListItem[]
}