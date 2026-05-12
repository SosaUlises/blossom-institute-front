'use client'

import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  ArrowLeft,
  Archive,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  CalendarCheck2,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
  Loader2,
  Megaphone,
  MessageSquareText,
  Save,
  Trash2,
  Upload,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  StudentIconContainer,
  StudentStatusBadge,
  studentUi,
} from '@/components/student/courses/student-course-ui'
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
  feedbackVigente?: StudentCurrentFeedback | null
  texto?: string | null
  adjuntos?: StudentAttachment[] | null
  fechaEntregaUtc?: string | null
  fechaEntregadaUtc?: string | null
  estado?: string | number | null
}

type StudentCurrentFeedback = {
  feedbackId?: number | null
  estado?: string | number | null
  comentario?: string | null
  nota?: string | number | null
  fechaCorreccionUtc?: string | null
  adjuntos?: StudentAttachment[] | null
}

type StudentTask = {
  tareaId?: number
  cursoId?: number
  cursoNombre?: string | null
  profesorNombre?: string | null
  profesorApellido?: string | null
  titulo?: string | null
  descripcion?: string | null
  consigna?: string | null
  fechaEntregaUtc?: string | null
  createdAtUtc?: string | null
  esAnuncio?: boolean | null
  recursos?: StudentAttachment[] | null
  vencida?: boolean | null
  miEntrega?: StudentDelivery | null
}

type LoadState = {
  loading: boolean
  error: string | null
  task: StudentTask | null
}

const UPLOADED_FILE_ATTACHMENT_TYPE = 1
const STUDENT_UPLOAD_STORAGE_PROVIDER = 1

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

function formatDateTime(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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

function getAttachmentIcon(attachment: StudentAttachment) {
  const contentType = safeText(attachment.contentType)?.toLowerCase() ?? ''
  const name = safeText(attachment.nombre)?.toLowerCase() ?? ''

  if (contentType.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/.test(name)) {
    return FileImage
  }

  if (contentType.startsWith('video/') || /\.(mp4|mov|webm)$/.test(name)) {
    return FileVideo
  }

  if (contentType.startsWith('audio/') || /\.(mp3|wav|ogg)$/.test(name)) {
    return FileAudio
  }

  if (
    contentType.includes('zip') ||
    contentType.includes('compressed') ||
    /\.(zip|rar|7z)$/.test(name)
  ) {
    return Archive
  }

  return FileText
}

function normalizeAttachments(attachments: StudentAttachment[]) {
  return attachments.map((attachment) => ({
    tipo: attachment.tipo ?? UPLOADED_FILE_ATTACHMENT_TYPE,
    url: attachment.url ?? '',
    nombre: attachment.nombre ?? 'Adjunto',
    storageProvider: attachment.storageProvider ?? STUDENT_UPLOAD_STORAGE_PROVIDER,
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

function getTeacherName(task?: StudentTask | null) {
  const firstName = safeText(task?.profesorNombre)
  const lastName = safeText(task?.profesorApellido)
  return [firstName, lastName].filter(Boolean).join(' ').trim() || 'Profesor'
}

function getAnnouncementTeacherName(task?: StudentTask | null) {
  const firstName = safeText(task?.profesorNombre)
  const lastName = safeText(task?.profesorApellido)
  return [firstName, lastName].filter(Boolean).join(' ').trim() || null
}

function isAnnouncementTask(task?: StudentTask | null) {
  return task?.esAnuncio === true || !safeText(task?.fechaEntregaUtc)
}

function getFeedbackEstado(feedback?: StudentCurrentFeedback | null) {
  const rawEstado = feedback?.estado
  const estado =
    typeof rawEstado === 'string' ? rawEstado.trim().toLowerCase() : rawEstado

  if (estado === 1 || estado === '1' || estado === 'aprobado') {
    return {
      label: 'Aprobado',
      intent: 'approved' as const,
      title: 'Tu entrega fue aprobada',
      iconClass:
        'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300',
      badgeClass:
        'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300',
    }
  }

  if (estado === 2 || estado === '2' || estado === 'rehacer') {
    return {
      label: 'Necesita cambios',
      intent: 'redo' as const,
      title: 'Tu profe pidió algunos cambios',
      iconClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
      badgeClass:
        'border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-300',
    }
  }

  return {
    label: 'Feedback',
    intent: 'neutral' as const,
    title: 'Mensaje de tu profe',
    iconClass: 'bg-primary/10 text-primary',
    badgeClass: 'border-primary/15 bg-primary/10 text-primary',
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
  const AttachmentIcon = getAttachmentIcon(attachment)
  const rowClassName =
    cn('flex min-h-12 items-center justify-between gap-3 rounded-xl border border-border/50 bg-background/60 px-3 py-2 transition-colors hover:border-primary/25 hover:bg-primary/5', studentUi.focus)
  const content = (
    <>
      <StudentIconContainer
        icon={AttachmentIcon}
        size="sm"
        className="size-10 rounded-lg border-transparent bg-primary/10 text-primary ring-1 ring-primary/10"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-foreground">
          {name}
        </span>
        <span className="block text-xs text-muted-foreground">
          {size ?? attachment.contentType ?? 'Archivo'}
        </span>
      </span>
    </>
  )

  if (!onRemove) {
    return (
      <a
        href={attachment.url ?? '#'}
        target="_blank"
        rel="noreferrer"
        className={rowClassName}
      >
        <span className="flex min-w-0 flex-1 items-center gap-3">
          {content}
        </span>
        <Download className="size-4 shrink-0 text-muted-foreground" />
      </a>
    )
  }

  return (
    <div className={rowClassName}>
      <a
        href={attachment.url ?? '#'}
        target="_blank"
        rel="noreferrer"
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        {content}
      </a>

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
        setShowForm(
          (!task.miEntrega && task.vencida !== true) ||
            getFeedbackEstado(task.miEntrega?.feedbackVigente).intent === 'redo',
        )
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
  const currentFeedback = currentDelivery?.feedbackVigente ?? null
  const feedbackEstado = getFeedbackEstado(currentFeedback)
  const feedbackComment = safeText(currentFeedback?.comentario)
  const feedbackNote = displayValue(currentFeedback?.nota)
  const feedbackDate = formatDateTime(currentFeedback?.fechaCorreccionUtc)
  const feedbackAttachments = currentFeedback?.adjuntos ?? []
  const isAnnouncement = isAnnouncementTask(task)
  const teacherName = getTeacherName(task)
  const announcementTeacherName = getAnnouncementTeacherName(task)
  const createdAt = formatDate(task?.createdAtUtc)
  const feedbackNeedsChanges = feedbackEstado.intent === 'redo'
  const feedbackApproved = feedbackEstado.intent === 'approved'
  const taskStatusLabel = feedbackNeedsChanges
    ? 'Necesita cambios'
    : feedbackApproved
      ? 'Aprobada'
    : currentDelivery
      ? 'Entregada'
      : task?.vencida
        ? 'Se venció'
        : 'Para entregar'
  const taskStatusClassName = feedbackNeedsChanges
    ? 'border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-300'
    : feedbackApproved
      ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300'
    : currentDelivery
      ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300'
      : task?.vencida
        ? 'border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300'
        : 'border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300'
  const taskStatusTextClassName = feedbackNeedsChanges
    ? 'text-amber-700 dark:text-amber-300'
    : feedbackApproved
      ? 'text-emerald-800 dark:text-emerald-300'
    : currentDelivery
      ? 'text-emerald-800 dark:text-emerald-300'
      : task?.vencida
        ? 'text-rose-700 dark:text-rose-300'
        : 'text-sky-700 dark:text-sky-300'
  const saveButtonLabel = currentDelivery
    ? feedbackNeedsChanges
      ? 'Volver a entregar'
      : 'Guardar cambios'
    : 'Entregar tarea'
  const actionState = feedbackNeedsChanges
    ? {
        title: 'Tu profe pidió cambios',
        description: 'Revisá el mensaje y corregí tu entrega.',
        cta: 'Corregir entrega',
        icon: AlertCircle,
        className:
          'border-amber-500/30 bg-amber-500/[0.08] text-amber-900 dark:text-amber-100',
        iconClassName: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
        buttonClassName: 'bg-amber-600 text-white hover:bg-amber-700',
      }
    : feedbackApproved
      ? {
          title: 'Tu profe aprobó tu entrega',
          description: 'Tu trabajo ya está revisado.',
          cta: 'Ver entrega',
          icon: CheckCircle2,
          className:
            'border-emerald-200 bg-card text-foreground dark:border-emerald-500/20 dark:bg-card dark:text-foreground',
          iconClassName:
            'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300',
          buttonClassName: '',
        }
      : currentDelivery
        ? {
            title: 'Tu tarea está entregada',
            description: 'Podés revisar o editar lo que enviaste.',
            cta: 'Editar entrega',
            icon: CheckCircle2,
            className:
              'border-emerald-300 bg-card text-foreground dark:border-emerald-500/25',
            iconClassName:
              'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300',
            buttonClassName: '',
          }
        : task?.vencida
          ? {
              title: 'La fecha ya pasó',
              description: 'Leé la consigna y consultá con tu profe si hace falta.',
              cta: null,
              icon: AlertCircle,
              className:
                'border-rose-500/25 bg-rose-500/[0.06] text-rose-900 dark:text-rose-100',
              iconClassName: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
              buttonClassName: '',
            }
          : {
              title: 'Tenés que entregar esta tarea',
              description: 'Leé la consigna, usá los materiales y enviá tu trabajo.',
              cta: 'Entregar tarea',
              icon: Clock3,
              className:
                'border-sky-500/25 bg-sky-500/[0.06] text-sky-900 dark:text-sky-100',
              iconClassName: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
              buttonClassName: '',
            }
  const ActionIcon = actionState.icon

  useEffect(() => {
    if (!task) return

    const fallbackSubtitle = safeText(task.cursoNombre) ?? 'Blossom Institute · Alumno'

    window.dispatchEvent(
      new CustomEvent('app-header:update', {
        detail: {
          title: safeText(task.cursoNombre) ?? (isAnnouncement ? 'Anuncio' : 'Tarea'),
          subtitle: safeText(task.cursoNombre)
            ? isAnnouncement
              ? 'Anuncio'
              : 'Tarea'
            : fallbackSubtitle,
        },
      }),
    )
  }, [isAnnouncement, task])

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

  function renderActionPanel() {
    return (
      <section
        className={cn(
          'rounded-[24px] border p-5 shadow-[0_16px_34px_-30px_rgba(15,23,42,0.22)]',
          actionState.className,
        )}
      >
        <div className="flex items-start gap-3">
          <StudentIconContainer
            icon={ActionIcon}
            size="md"
            className={actionState.iconClassName}
          />
          <div className="min-w-0">
            <h2 className="text-lg font-semibold leading-6 tracking-tight">
              {actionState.title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {actionState.description}
            </p>
          </div>
        </div>

        <Button
          type="button"
          className={cn(
            'mt-4 w-full rounded-xl focus-visible:ring-primary/30',
            feedbackApproved ? 'h-9 text-sm' : 'h-11',
            actionState.buttonClassName ||
              'border-border/70 bg-background text-foreground hover:border-primary/20 hover:bg-muted/50 hover:text-foreground',
          )}
          variant={actionState.buttonClassName ? 'default' : 'outline'}
          onClick={() => {
            if (feedbackApproved || (task?.vencida && !currentDelivery)) {
              setShowForm(false)
              return
            }

            setShowForm(true)
          }}
        >
          {actionState.cta}
        </Button>
      </section>
    )
  }

  function renderDeliveryPanel() {
    return (
      <section
        id="tu-trabajo"
        className={cn(
          'rounded-[24px] border bg-card p-5',
          feedbackNeedsChanges
            ? 'border-amber-500/25'
            : currentFeedback?.estado
              ? 'border-emerald-300 dark:border-emerald-500/25'
              : 'border-border/70',
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Tu trabajo
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {currentDelivery
                ? 'Este es el estado de tu tarea.'
                : 'Todavía no cargaste una entrega.'}
            </p>
          </div>

          {currentDelivery ? (
            <StudentStatusBadge
              className={cn(
                studentUi.badge.compact,
                currentFeedback ? feedbackEstado.badgeClass : taskStatusClassName,
              )}
            >
              {currentFeedback ? feedbackEstado.label : 'Guardada'}
            </StudentStatusBadge>
          ) : null}
        </div>

        {currentDelivery ? (
          <div className="mt-5 space-y-5">
            <div className="relative pl-6 before:absolute before:left-2 before:top-2 before:h-full before:w-px before:bg-border">
              <span className="absolute left-0 top-1 flex size-4 items-center justify-center rounded-full bg-primary">
                <span className="size-1.5 rounded-full bg-primary-foreground" />
              </span>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                <h3 className="font-semibold tracking-tight text-foreground">
                  Entregaste
                </h3>
                {deliveryDate ? (
                  <>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">{deliveryDate}</span>
                  </>
                ) : null}
                {deliveryStatus ? (
                  <>
                    <span className="text-muted-foreground">·</span>
                    <span className="font-medium text-primary">{deliveryStatus}</span>
                  </>
                ) : null}
              </div>

              {deliveryContent ? (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground/80">
                  {deliveryContent}
                </p>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  Entrega sin texto.
                </p>
              )}

              {currentFile ? (
                <div className="mt-3">
                  <AttachmentLink attachment={currentFile} />
                </div>
              ) : null}

              {currentAttachments.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {currentAttachments.map((attachment, index) => (
                    <AttachmentLink
                      key={attachment.storageKey ?? attachment.url ?? index}
                      attachment={attachment}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
            Cuando entregues, vas a ver acá tu respuesta, tus archivos y el mensaje de tu profe.
          </div>
        )}

        {currentFeedback ? (
          <div
            className={cn(
              'mt-5 border-t pt-5',
              feedbackNeedsChanges ? 'border-amber-500/20' : 'border-border/60',
            )}
          >
            <div className="relative pl-6 before:absolute before:left-2 before:top-2 before:h-full before:w-px before:bg-border">
              <span
                className={cn(
                  'absolute left-0 top-1 flex size-4 items-center justify-center rounded-full',
                  feedbackNeedsChanges ? 'bg-amber-500' : 'bg-emerald-600',
                )}
              >
                <span className="size-1.5 rounded-full bg-white" />
              </span>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-2.5">
                  <StudentIconContainer
                    icon={MessageSquareText}
                    size="sm"
                    className={cn('mt-0.5', feedbackEstado.iconClass)}
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold tracking-tight text-foreground">
                      {feedbackNeedsChanges
                        ? 'Tu profe pidió algunos cambios'
                        : 'Mensaje de tu profe'}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {feedbackDate ?? 'Fecha de corrección no disponible'}
                    </p>
                  </div>
                </div>

                {feedbackNote ? (
                  <span className={cn(studentUi.badge.compact, 'border-border/60 bg-background/70 text-foreground')}>
                    Nota: {feedbackNote}
                  </span>
                ) : null}
              </div>

              {feedbackComment ? (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground/85">
                  {feedbackComment}
                </p>
              ) : null}

              {feedbackAttachments.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {feedbackAttachments.map((attachment, index) => (
                    <AttachmentLink
                      key={attachment.storageKey ?? attachment.url ?? index}
                      attachment={attachment}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : currentDelivery ? (
          <p className="mt-5 border-t border-border/60 pt-4 text-sm text-muted-foreground">
            Tu profe todavía no dejó comentarios.
          </p>
        ) : null}

        {currentDelivery ? (
          <Button
            type="button"
            variant="outline"
            className={cn('mt-5 h-10 w-full sm:w-fit', studentUi.button.secondaryCta)}
            onClick={() => setShowForm((current) => !current)}
          >
            {showForm ? 'Cerrar edición' : feedbackNeedsChanges ? 'Volver a entregar' : 'Editar entrega'}
            <ChevronDown
              className={cn(
                'size-4 transition-transform',
                showForm ? 'rotate-180' : '',
              )}
            />
          </Button>
        ) : null}

        {showForm ? (
          <div className="mt-5 space-y-3">
            <Textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Escribí tu respuesta..."
              className="min-h-32 rounded-xl bg-background/70 text-base"
            />

            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary">
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
              <p className="text-sm text-muted-foreground">
                Podés agregar archivos si los necesitás.
              </p>
            )}

            {formError ? (
              <p className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-400">
                {formError}
              </p>
            ) : null}

            {success ? (
              <p className="flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300">
                <CheckCircle2 className="size-4" />
                {success}
              </p>
            ) : null}

            <Button
              type="button"
              className="h-10 w-full rounded-xl sm:w-fit"
              onClick={handleSave}
              disabled={saving || uploading}
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {saveButtonLabel}
            </Button>
          </div>
        ) : null}
      </section>
    )
  }

  if (state.loading) {
    return (
      <div className={cn('grid min-h-[320px] place-items-center px-6 text-center', studentUi.card.grade)}>
        <div>
          <Loader2 className="mx-auto size-8 animate-spin text-primary" />
          <p className="mt-4 text-sm font-medium text-muted-foreground">
            Estamos cargando la publicación.
          </p>
        </div>
      </div>
    )
  }

  if (state.error || !task) {
    return (
      <Card className={studentUi.card.panel}>
        <CardContent className="px-6 py-14 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            No pudimos cargar esta publicación.
          </p>
          <Button asChild variant="ghost" className={cn('mt-5', studentUi.button.ghost)}>
            <Link href={`/student/courses/${courseId}`}>Volver al tablón</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (isAnnouncement) {
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <Button
          asChild
          variant="ghost"
          className={cn('mt-5', studentUi.button.ghost)}
        >
          <Link href={`/student/courses/${courseId}`}>
            <ArrowLeft className="size-4" />
            Volver al tablón
          </Link>
        </Button>

        <article className={cn(studentUi.card.grade, 'border-violet-500/15 bg-card sm:p-6')}>
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <StudentIconContainer
                icon={Megaphone}
                className="border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300"
              />

              <div className="min-w-0">
                <p className="text-sm font-medium text-muted-foreground">
                  {announcementTeacherName
                    ? `${announcementTeacherName} publicó un anuncio`
                    : 'Anuncio del curso'}
                </p>
                {createdAt ? (
                  <time className="mt-0.5 block text-xs text-muted-foreground">
                    Publicado {createdAt}
                  </time>
                ) : null}
              </div>
            </div>

            <StudentStatusBadge
              icon={Megaphone}
              className="border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300"
            >
              Anuncio
            </StudentStatusBadge>
          </header>

          <div className="mt-5">
            <h1 className="text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
              {safeText(task.titulo) ?? 'Sin título'}
            </h1>

            <div className="mt-4 text-base leading-7 text-foreground/85">
              {safeText(task.consigna) ?? safeText(task.descripcion) ? (
                <p className="whitespace-pre-wrap">
                  {safeText(task.consigna) ?? safeText(task.descripcion)}
                </p>
              ) : (
                <p>Sin contenido cargado.</p>
              )}
            </div>
          </div>
        </article>

        {resources.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Recursos
            </h2>
            <div className="space-y-2">
              {resources.map((resource, index) => (
                <AttachmentLink
                  key={resource.storageKey ?? resource.url ?? index}
                  attachment={resource}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
        <Button
          asChild
        variant="ghost"
        className={cn('mt-5', studentUi.button.ghost)}
        >
        <Link href={`/student/courses/${courseId}`}>
          <ArrowLeft className="size-4" />
          Volver al tablón
        </Link>
      </Button>

      <header className="space-y-2">
        <h1 className="text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
          {safeText(task.titulo) ?? 'Sin título'}
        </h1>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          {dueDate ? (
            <span className="inline-flex items-center gap-1.5">
              <CalendarCheck2 className="size-3.5" />
              Vence el {dueDate}
            </span>
          ) : null}
          {dueDate ? <span aria-hidden="true">·</span> : null}
          <span
            className={cn(
              'font-semibold',
              taskStatusTextClassName,
            )}
          >
            {taskStatusLabel}
          </span>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <aside className="order-1 space-y-4 lg:sticky lg:top-6 lg:order-2">
          {renderActionPanel()}
          {renderDeliveryPanel()}
        </aside>

        <div className="order-2 space-y-8 lg:order-1">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Consigna
            </h2>
            {safeText(task.consigna) ? (
              <p className="whitespace-pre-wrap text-base leading-7 text-foreground/85">
                {task.consigna}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Esta tarea no tiene consigna cargada.
              </p>
            )}
          </section>

          {resources.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Materiales
              </h2>
              <div className="space-y-2">
                {resources.map((resource, index) => (
                  <AttachmentLink
                    key={resource.storageKey ?? resource.url ?? index}
                    attachment={resource}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  )
}
