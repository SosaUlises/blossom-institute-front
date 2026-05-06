'use client'

import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Download,
  FileText,
  Loader2,
  Paperclip,
  Save,
  Trash2,
  Upload,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

type ApiEnvelope<T> = {
  message?: string
  data?: T
}

type StudentAttachment = {
  tipo?: number | string | null
  url?: string | null
  nombre?: string | null
  storageProvider?: string | number | null
  storageKey?: string | null
  contentType?: string | null
  sizeBytes?: number | null
}

type StudentDelivery = {
  entregaId?: number | null
  contenido?: string | null
  archivoUrl?: string | null
  feedbackVigente?: string | null
  texto?: string | null
  adjuntos?: StudentAttachment[] | null
  fechaEntregaUtc?: string | null
  fechaEntregadaUtc?: string | null
  estado?: string | number | null
}

type StudentTask = {
  tareaId?: number
  cursoId?: number
  cursoNombre?: string | null
  titulo?: string | null
  descripcion?: string | null
  consigna?: string | null
  fechaEntregaUtc?: string | null
  recursos?: StudentAttachment[] | null
  vencida?: boolean | null
  miEntrega?: StudentDelivery | null
}

type LoadState = {
  loading: boolean
  error: string | null
  task: StudentTask | null
}

function unwrap<T>(value: unknown): T {
  const record = value as ApiEnvelope<T> | null
  return (record?.data ?? value) as T
}

function formatDate(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function safeText(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function displayValue(value: unknown) {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return null
}

function formatBytes(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return null
  }

  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`
  return `${(value / 1024 / 1024).toFixed(1)} MB`
}

function normalizeAttachments(attachments: StudentAttachment[]) {
  return attachments.map((attachment) => ({
    tipo: attachment.tipo ?? null,
    url: attachment.url ?? '',
    nombre: attachment.nombre ?? 'Adjunto',
    storageProvider: attachment.storageProvider ?? null,
    storageKey: attachment.storageKey ?? '',
    contentType: attachment.contentType ?? null,
    sizeBytes: attachment.sizeBytes ?? null,
  }))
}

function getDeliveryContent(delivery?: StudentDelivery | null) {
  return safeText(delivery?.contenido) ?? safeText(delivery?.texto) ?? ''
}

function getDeliveryFile(delivery?: StudentDelivery | null): StudentAttachment | null {
  const url = safeText(delivery?.archivoUrl)
  if (!url) return null

  return {
    url,
    nombre: 'Archivo entregado',
  }
}

async function fetchTask(courseId: number, taskId: number) {
  const response = await fetch(
    `/api/student/courses/${courseId}/tasks/${taskId}`,
    {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    }
  )
  const result = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(result?.message || 'No se pudo cargar la tarea.')
  }

  return unwrap<StudentTask>(result)
}

async function uploadAttachment(file: File) {
  const formData = new FormData()
  formData.append('File', file)
  formData.append('Folder', 'student-submissions')

  const response = await fetch('/api/student/uploads', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })
  const result = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(result?.message || 'No se pudo subir el archivo.')
  }

  return unwrap<StudentAttachment>(result)
}

async function deleteAttachment(storageKey: string) {
  const response = await fetch('/api/student/uploads', {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ storageKey }),
  })
  const result = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(result?.message || 'No se pudo quitar el archivo.')
  }
}

async function saveDelivery(
  courseId: number,
  taskId: number,
  texto: string,
  adjuntos: StudentAttachment[]
) {
  const response = await fetch(
    `/api/student/courses/${courseId}/tasks/${taskId}`,
    {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        texto,
        adjuntos: normalizeAttachments(adjuntos),
      }),
    }
  )
  const result = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(result?.message || 'No se pudo guardar la entrega.')
  }

  return result
}

function AttachmentLink({
  attachment,
  onRemove,
  removing,
}: {
  attachment: StudentAttachment
  onRemove?: () => void
  removing?: boolean
}) {
  const name = safeText(attachment.nombre) ?? 'Adjunto'
  const size = formatBytes(attachment.sizeBytes)

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/75 px-3 py-3 transition-all hover:border-primary/20 hover:bg-card">
      <a
        href={attachment.url ?? '#'}
        target="_blank"
        rel="noreferrer"
        className="flex min-w-0 items-center gap-3"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <FileText className="size-4" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-foreground">
            {name}
          </span>
          <span className="block text-xs text-muted-foreground">
            {size ?? attachment.contentType ?? 'Archivo'}
          </span>
        </span>
      </a>

      {onRemove ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          disabled={removing}
          className="shrink-0 text-muted-foreground hover:text-destructive"
        >
          {removing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
        </Button>
      ) : (
        <Download className="size-4 shrink-0 text-muted-foreground" />
      )}
    </div>
  )
}

function EmptyBox({ text }: { text: string }) {
  return (
    <div className="rounded-[24px] border border-dashed border-border/70 bg-muted/20 px-5 py-8 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Paperclip className="size-5" />
      </div>
      <p className="mt-3 text-sm font-medium text-muted-foreground">{text}</p>
    </div>
  )
}

export function StudentTaskDetail({
  courseId,
  taskId,
}: {
  courseId: number
  taskId: number
}) {
  const router = useRouter()
  const [state, setState] = useState<LoadState>({
    loading: true,
    error: null,
    task: null,
  })
  const [text, setText] = useState('')
  const [attachments, setAttachments] = useState<StudentAttachment[]>([])
  const [showForm, setShowForm] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [removingKey, setRemovingKey] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    setState({ loading: true, error: null, task: null })

    fetchTask(courseId, taskId)
      .then((task) => {
        if (!mounted) return

        setState({ loading: false, error: null, task })
        setText(getDeliveryContent(task.miEntrega))
        setAttachments(task.miEntrega?.adjuntos ?? [])
        setShowForm(!task.miEntrega)
      })
      .catch((error) => {
        if (!mounted) return

        setState({
          loading: false,
          error: error instanceof Error ? error.message : 'No se pudo cargar.',
          task: null,
        })
      })

    return () => {
      mounted = false
    }
  }, [courseId, taskId])

  const task = state.task
  const dueDate = formatDate(task?.fechaEntregaUtc)
  const resources = useMemo(() => task?.recursos ?? [], [task?.recursos])
  const currentDelivery = task?.miEntrega
  const currentFile = getDeliveryFile(currentDelivery)
  const currentAttachments = currentDelivery?.adjuntos ?? []
  const deliveryDate =
    formatDate(currentDelivery?.fechaEntregaUtc)
  const deliveryContent = getDeliveryContent(currentDelivery)
  const deliveryStatus = displayValue(currentDelivery?.estado)
  const deliveryFeedback = safeText(currentDelivery?.feedbackVigente)

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) return

    setUploading(true)
    setFormError(null)
    setSuccess(null)

    try {
      const uploaded = await Promise.all(files.map((file) => uploadAttachment(file)))
      setAttachments((current) => [...current, ...uploaded])
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'No se pudo subir el archivo.'
      )
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  async function handleRemove(attachment: StudentAttachment, index: number) {
    setFormError(null)
    setSuccess(null)
    setRemovingKey(attachment.storageKey ?? String(index))

    try {
      if (attachment.storageKey) {
        await deleteAttachment(attachment.storageKey)
      }

      setAttachments((current) =>
        current.filter((item, itemIndex) => itemIndex !== index)
      )
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'No se pudo quitar el archivo.'
      )
    } finally {
      setRemovingKey(null)
    }
  }

  async function handleSave() {
    const trimmedText = text.trim()

    setFormError(null)
    setSuccess(null)

    if (!trimmedText && attachments.length === 0) {
      setFormError('Agrega texto o al menos un adjunto para guardar la entrega.')
      return
    }

    setSaving(true)

    try {
      await saveDelivery(courseId, taskId, trimmedText, attachments)
      setSuccess('Entrega guardada correctamente.')
      router.refresh()
      router.push(`/student/courses/${courseId}`)
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'No se pudo guardar la entrega.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (state.loading) {
    return (
      <div className="grid min-h-[420px] place-items-center rounded-[32px] border border-border/60 bg-card/95">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (state.error || !task) {
    return (
      <Card className="rounded-[30px] border border-border/60 bg-card/95">
        <CardContent className="px-6 py-14 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            {state.error ?? 'No se pudo cargar la tarea.'}
          </p>
          <Button asChild className="mt-5 rounded-xl">
            <Link href={`/student/courses/${courseId}`}>Volver al curso</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[32px] border border-border/60 bg-card/95 shadow-[0_24px_80px_-34px_rgba(15,23,42,0.22)]">
        <div className="absolute inset-x-0 top-0 h-36 bg-[linear-gradient(135deg,rgba(36,59,123,0.92),rgba(91,110,225,0.82))]" />
        <div className="relative p-4 sm:p-5 lg:p-6">
          <div className="rounded-[30px] border border-border/60 bg-card/92 p-6 shadow-[0_24px_50px_-30px_rgba(15,23,42,0.24)] backdrop-blur-md sm:p-7">
            <Button
              asChild
              variant="ghost"
              className="mb-5 rounded-xl px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
            >
              <Link href={`/student/courses/${courseId}`}>
                <ArrowLeft className="size-4" />
                Volver al curso
              </Link>
            </Button>

            <div className="flex flex-wrap items-center gap-3">
              <span
                className={cn(
                  'inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]',
                  task.vencida
                    ? 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400'
                    : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                )}
              >
                {task.vencida ? 'Vencida' : 'En fecha'}
              </span>

              {dueDate ? (
                <span className="inline-flex rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
                  Entrega {dueDate}
                </span>
              ) : null}
            </div>

            <h1 className="mt-5 text-[2.1rem] font-semibold leading-[1.04] tracking-tight text-foreground sm:text-[2.6rem]">
              {safeText(task.titulo) ?? 'Sin título'}
            </h1>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <Card className="rounded-[30px] border-border/60 bg-card/95 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Consigna
              </h2>
              <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground">
                {safeText(task.consigna) ? (
                  <p className="whitespace-pre-wrap">{task.consigna}</p>
                ) : (
                  <EmptyBox text="Esta tarea no tiene consigna cargada." />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[30px] border-border/60 bg-card/95 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Recursos
              </h2>

              <div className="mt-4 space-y-3">
                {resources.length > 0 ? (
                  resources.map((resource, index) => (
                    <AttachmentLink
                      key={resource.storageKey ?? resource.url ?? index}
                      attachment={resource}
                    />
                  ))
                ) : (
                  <EmptyBox text="No hay recursos adjuntos para esta tarea." />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="rounded-[30px] border-border/60 bg-card/95 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">
                    Mi entrega
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {currentDelivery
                      ? 'Ya tenes una entrega registrada.'
                      : 'Todavia no guardaste una entrega.'}
                  </p>
                </div>

                {currentDelivery ? (
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-400">
                    Guardada
                  </span>
                ) : null}
              </div>

              {currentDelivery ? (
                <div className="mt-5 space-y-4 rounded-[24px] border border-border/60 bg-background/75 p-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold tracking-tight text-foreground">
                        Ultima entrega
                      </p>
                      {deliveryDate ? (
                        <span className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          {deliveryDate}
                        </span>
                      ) : null}
                      {deliveryStatus ? (
                        <span className="rounded-full border border-primary/15 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                          {deliveryStatus}
                        </span>
                      ) : null}
                    </div>

                    {deliveryContent ? (
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                        {deliveryContent}
                      </p>
                    ) : (
                      <p className="mt-3 text-sm text-muted-foreground">
                        Sin contenido de texto.
                      </p>
                    )}
                  </div>

                  {currentFile ? <AttachmentLink attachment={currentFile} /> : null}

                  {currentAttachments.length > 0 ? (
                    <div className="space-y-2">
                      {currentAttachments.map((attachment, index) => (
                        <AttachmentLink
                          key={attachment.storageKey ?? attachment.url ?? index}
                          attachment={attachment}
                        />
                      ))}
                    </div>
                  ) : null}

                  {deliveryFeedback ? (
                    <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4 text-sm leading-6 text-sky-700 dark:text-sky-400">
                      <p className="font-semibold">Feedback</p>
                      <p className="mt-1 whitespace-pre-wrap">{deliveryFeedback}</p>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {currentDelivery ? (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-5 h-11 w-full rounded-2xl"
                  onClick={() => setShowForm((current) => !current)}
                >
                  {showForm ? 'Ocultar formulario' : 'Actualizar entrega'}
                  <ChevronDown
                    className={cn(
                      'size-4 transition-transform',
                      showForm ? 'rotate-180' : ''
                    )}
                  />
                </Button>
              ) : null}

              {showForm ? (
              <div className="mt-5 space-y-3">
                <Textarea
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Escribi tu respuesta..."
                  className="min-h-36 rounded-2xl bg-background/70"
                />

                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-4 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary">
                  {uploading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Upload className="size-4" />
                  )}
                  Subir adjunto
                  <Input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleUpload}
                    disabled={uploading}
                  />
                </label>

                {attachments.length > 0 ? (
                  <div className="space-y-2">
                    {attachments.map((attachment, index) => (
                      <AttachmentLink
                        key={attachment.storageKey ?? attachment.url ?? index}
                        attachment={attachment}
                        removing={removingKey === (attachment.storageKey ?? String(index))}
                        onRemove={() => handleRemove(attachment, index)}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyBox text="No agregaste adjuntos todavia." />
                )}

                {formError ? (
                  <p className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-400">
                    {formError}
                  </p>
                ) : null}

                {success ? (
                  <p className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="size-4" />
                    {success}
                  </p>
                ) : null}

                <Button
                  type="button"
                  className="h-11 w-full rounded-2xl"
                  onClick={handleSave}
                  disabled={saving || uploading}
                >
                  {saving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Guardar entrega
                </Button>
              </div>
              ) : null}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
