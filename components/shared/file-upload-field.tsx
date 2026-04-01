'use client'

import { useMemo, useRef, useState } from 'react'
import {
  FileAudio,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Loader2,
  Paperclip,
  Upload,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  deleteUploadedFile,
  uploadFile,
  type UploadedFileResult,
} from '@/lib/uploads/api'

type Props = {
  folder: string
  value?: UploadedFileResult | null
  values?: UploadedFileResult[]
  onUploaded?: (file: UploadedFileResult) => void
  onUploadedMany?: (files: UploadedFileResult[]) => void
  onRemove?: () => void
  onRemoveAt?: (index: number) => void
  label?: string
  maxSizeMb?: number
  multiple?: boolean
  deleteOnRemove?: boolean
}

const ACCEPTED_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.txt',
  '.csv',
  '.mp3',
  '.wav',
  '.m4a',
  '.ogg',
  '.mp4',
  '.mov',
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.zip',
  '.rar',
]

const ACCEPT_ATTRIBUTE = ACCEPTED_EXTENSIONS.join(',')

function getExtension(filename?: string) {
  if (!filename) return ''
  const index = filename.lastIndexOf('.')
  return index >= 0 ? filename.slice(index).toLowerCase() : ''
}

function formatBytes(bytes?: number | null) {
  if (!bytes || bytes <= 0) return 'Tamaño desconocido'

  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unitIndex = 0

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex++
  }

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

function getFileIcon(filename?: string, contentType?: string | null) {
  const extension = getExtension(filename)

  if (
    contentType?.startsWith('audio/') ||
    ['.mp3', '.wav', '.m4a', '.ogg'].includes(extension)
  ) {
    return FileAudio
  }

  if (
    contentType?.startsWith('image/') ||
    ['.jpg', '.jpeg', '.png', '.webp'].includes(extension)
  ) {
    return FileImage
  }

  if (
    contentType?.startsWith('video/') ||
    ['.mp4', '.mov'].includes(extension)
  ) {
    return FileVideo
  }

  if (['.xls', '.xlsx', '.csv'].includes(extension)) {
    return FileSpreadsheet
  }

  return FileText
}

export function FileUploadField({
  folder,
  value,
  values = [],
  onUploaded,
  onUploadedMany,
  onRemove,
  onRemoveAt,
  label = 'Adjuntar archivo',
  maxSizeMb = 20,
  multiple = false,
  deleteOnRemove = true,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)
  const [removingIndex, setRemovingIndex] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const maxBytes = useMemo(() => maxSizeMb * 1024 * 1024, [maxSizeMb])

  const handlePick = () => {
    inputRef.current?.click()
  }

  const validateFile = (file: File) => {
    const extension = getExtension(file.name)

    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      throw new Error(
        'Tipo de archivo no permitido. Usá PDF, Office, audio, imagen, video o comprimidos.'
      )
    }

    if (file.size > maxBytes) {
      throw new Error(`El archivo supera el límite de ${maxSizeMb} MB.`)
    }
  }

  const dedupeFiles = (files: UploadedFileResult[]) => {
    const map = new Map<string, UploadedFileResult>()

    for (const file of files) {
      const key = (file.storageKey || file.url || '').trim().toLowerCase()
      if (!key) continue
      if (!map.has(key)) {
        map.set(key, file)
      }
    }

    return Array.from(map.values())
  }

  const handleChange = async (fileList?: FileList | null) => {
    if (!fileList || fileList.length === 0) return

    try {
      setUploading(true)
      setError(null)

      const files = Array.from(fileList)

      for (const file of files) {
        validateFile(file)
      }

      if (multiple) {
        const uploadedFiles: UploadedFileResult[] = []

        for (const file of files) {
          const uploaded = await uploadFile(file, folder)
          uploadedFiles.push(uploaded)
        }

        onUploadedMany?.(dedupeFiles([...(values ?? []), ...uploadedFiles]))
      } else {
        const uploaded = await uploadFile(files[0], folder)
        onUploaded?.(uploaded)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error subiendo archivo.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const removeSingle = async () => {
    try {
      setError(null)
      setRemovingIndex(0)

      if (deleteOnRemove && value?.storageKey) {
        await deleteUploadedFile(value.storageKey)
      }

      onRemove?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminando archivo.')
    } finally {
      setRemovingIndex(null)
    }
  }

  const removeManyAt = async (index: number) => {
    try {
      setError(null)
      setRemovingIndex(index)

      const file = values[index]

      if (deleteOnRemove && file?.storageKey) {
        await deleteUploadedFile(file.storageKey)
      }

      onRemoveAt?.(index)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminando archivo.')
    } finally {
      setRemovingIndex(null)
    }
  }

  const renderFileRow = (
    file: UploadedFileResult,
    index: number,
    removable: boolean
  ) => {
    const FileIcon = getFileIcon(file.nombre, file.contentType)
    const isRemoving = removingIndex === index

    return (
      <div
        key={`${file.storageKey ?? file.url}-${index}`}
        className="rounded-[24px] border border-border/70 bg-background/75 p-4 shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FileIcon className="size-4.5" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {file.nombre}
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex rounded-full border border-border/60 bg-background/70 px-2.5 py-1">
                  {file.contentType ||
                    getExtension(file.nombre).replace('.', '').toUpperCase() ||
                    'Archivo'}
                </span>

                <span>{formatBytes(file.sizeBytes)}</span>
              </div>
            </div>
          </div>

          {removable ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isRemoving}
              className="rounded-xl text-muted-foreground transition hover:bg-destructive/5 hover:text-destructive"
              onClick={() => {
                if (multiple) {
                  void removeManyAt(index)
                } else {
                  void removeSingle()
                }
              }}
            >
              {isRemoving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <X className="size-4" />
              )}
            </Button>
          ) : null}
        </div>
      </div>
    )
  }

  const hasSingleValue = !multiple && !!value
  const hasManyValues = multiple && values.length > 0

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTRIBUTE}
        multiple={multiple}
        className="hidden"
        onChange={(e) => void handleChange(e.target.files)}
      />

      <div className="rounded-[24px] border border-dashed border-border/70 bg-background/60 p-4 transition-all duration-200 hover:border-primary/30 hover:bg-primary/5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Paperclip className="size-4 text-primary" />
              {label}
            </div>

            <p className="text-xs leading-5 text-muted-foreground">
              Permitidos: PDF, Word, Excel, PowerPoint, audio, imagen, video y ZIP/RAR.
              Máximo {maxSizeMb} MB.
              {multiple ? ' Podés seleccionar varios archivos.' : ''}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="rounded-2xl border-border/70 bg-background/70 transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
            onClick={handlePick}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="mr-2 size-4" />
                {multiple ? 'Seleccionar archivos' : 'Seleccionar archivo'}
              </>
            )}
          </Button>
        </div>
      </div>

      {hasSingleValue && value ? renderFileRow(value, 0, true) : null}

      {hasManyValues ? (
        <div className="space-y-3">
          {values.map((file, index) => renderFileRow(file, index, true))}
        </div>
      ) : null}

      {error && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  )
}