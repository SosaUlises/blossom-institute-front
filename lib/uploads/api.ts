export type UploadedFileResult = {
  url: string
  nombre: string
  storageProvider?: number | null
  storageKey?: string | null
  contentType?: string | null
  sizeBytes?: number | null
}

type ApiEnvelope<T> = {
  message?: string
  data?: T
}

export async function uploadFile(file: File, folder: string) {
  const formData = new FormData()
  formData.append('File', file)
  formData.append('Folder', folder)

  const response = await fetch('/api/uploads', {
    method: 'POST',
    body: formData,
  })

  const result = (await response.json()) as ApiEnvelope<UploadedFileResult>

  if (!response.ok) {
    throw new Error(result.message || 'No se pudo subir el archivo.')
  }

  return result.data as UploadedFileResult
}

export async function deleteUploadedFile(storageKey: string) {
  const response = await fetch('/api/uploads', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ storageKey }),
  })

  const result = (await response.json()) as ApiEnvelope<boolean>

  if (!response.ok) {
    throw new Error(result.message || 'No se pudo eliminar el archivo.')
  }

  return true
}
