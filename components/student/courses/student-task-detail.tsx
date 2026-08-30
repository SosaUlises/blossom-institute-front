'use client'

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type ComponentType,
  type ReactNode,
} from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  ArrowLeft,
  Archive,
  BookOpen,
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
  Paperclip,
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
import { UserAvatar } from '@/components/shared/user-avatar'
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
  profesorNombre?: string | null
  profesorApellido?: string | null
  profesorAvatarUrl?: string | null
  teacherName?: string | null
  teacherAvatarUrl?: string | null
  createdBy?: Record<string, unknown> | null
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
  profesorAvatarUrl?: string | null
  teacherName?: string | null
  teacherAvatarUrl?: string | null
  createdBy?: Record<string, unknown> | null
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

function getRecord(value: unknown) {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : null
}

function getRecordText(record: Record<string, unknown> | null | undefined, keys: string[]) {
  if (!record) return null

  for (const key of keys) {
    const value = safeText(record[key])
    if (value) return value
  }

  return null
}

function getNestedRecord(record: Record<string, unknown> | null | undefined, keys: string[]) {
  if (!record) return null

  for (const key of keys) {
    const nested = getRecord(record[key])
    if (nested) return nested
  }

  return null
}

function displayValue(value: unknown) {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return null
}

function getNumericValue(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value !== 'string' || !value.trim()) return null

  const normalized = value.trim().replace(',', '.')
  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function getGradeBadgeClass(value: unknown) {
  const grade = getNumericValue(value)

  if (grade == null) {
    return 'border-border/60 bg-background/70 text-foreground dark:bg-background/35'
  }

  if (grade < 65) {
    return 'border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300'
  }

  if (grade < 80) {
    return 'border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-300'
  }

  return 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300'
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

function isImageAttachment(attachment: StudentAttachment) {
  const contentType = safeText(attachment.contentType)?.toLowerCase() ?? ''
  const name = safeText(attachment.nombre)?.toLowerCase() ?? ''
  const url = safeText(attachment.url)?.toLowerCase() ?? ''

  return (
    contentType.startsWith('image/') ||
    /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/.test(name) ||
    /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/.test(url)
  )
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
  const directName = safeText(task?.teacherName)
  if (directName) return directName

  const taskRecord = getRecord(task)
  const createdBy = getNestedRecord(taskRecord, ['createdBy', 'CreatedBy', 'autor', 'author'])
  const nestedName = getRecordText(createdBy, ['nombreCompleto', 'fullName', 'name'])
  if (nestedName) return nestedName

  const firstName = safeText(task?.profesorNombre) ?? getRecordText(createdBy, ['nombre', 'firstName'])
  const lastName = safeText(task?.profesorApellido) ?? getRecordText(createdBy, ['apellido', 'lastName'])
  return [firstName, lastName].filter(Boolean).join(' ').trim() || 'Profesor'
}

function getAnnouncementTeacherName(task?: StudentTask | null) {
  const name = getTeacherName(task)
  return name === 'Profesor' ? null : name
}

function getTeacherAvatarUrl(task?: StudentTask | null) {
  const taskRecord = getRecord(task)
  const createdBy = getNestedRecord(taskRecord, ['createdBy', 'CreatedBy', 'autor', 'author'])

  return (
    safeText(task?.profesorAvatarUrl) ??
    safeText(task?.teacherAvatarUrl) ??
    getRecordText(taskRecord, [
      'ProfesorAvatarUrl',
      'TeacherAvatarUrl',
      'createdByAvatarUrl',
      'avatarUrl',
    ]) ??
    getRecordText(createdBy, ['avatarUrl', 'fotoUrl', 'profileImageUrl'])
  )
}

function getFeedbackTeacherName(
  feedback?: StudentCurrentFeedback | null,
  task?: StudentTask | null,
) {
  if (!feedback) return getAnnouncementTeacherName(task)

  const feedbackRecord = getRecord(feedback)
  const createdBy = getNestedRecord(feedbackRecord, ['createdBy', 'CreatedBy', 'autor', 'author'])
  const directName =
    safeText(feedback.teacherName) ??
    getRecordText(feedbackRecord, ['profesorNombreCompleto', 'teacherName']) ??
    getRecordText(createdBy, ['nombreCompleto', 'fullName', 'name'])

  if (directName) return directName

  const firstName =
    safeText(feedback.profesorNombre) ??
    getRecordText(feedbackRecord, ['ProfesorNombre', 'teacherFirstName']) ??
    getRecordText(createdBy, ['nombre', 'firstName'])
  const lastName =
    safeText(feedback.profesorApellido) ??
    getRecordText(feedbackRecord, ['ProfesorApellido', 'teacherLastName']) ??
    getRecordText(createdBy, ['apellido', 'lastName'])
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim()

  return fullName || getAnnouncementTeacherName(task)
}

function getFeedbackTeacherAvatarUrl(
  feedback?: StudentCurrentFeedback | null,
  task?: StudentTask | null,
) {
  const feedbackRecord = getRecord(feedback)
  const createdBy = getNestedRecord(feedbackRecord, ['createdBy', 'CreatedBy', 'autor', 'author'])

  return (
    safeText(feedback?.profesorAvatarUrl) ??
    safeText(feedback?.teacherAvatarUrl) ??
    getRecordText(feedbackRecord, [
      'ProfesorAvatarUrl',
      'TeacherAvatarUrl',
      'createdByAvatarUrl',
      'avatarUrl',
    ]) ??
    getRecordText(createdBy, ['avatarUrl', 'fotoUrl', 'profileImageUrl']) ??
    getTeacherAvatarUrl(task)
  )
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
      title: 'Tu profe dejó una mejora',
      iconClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
      badgeClass:
        'border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-300',
    }
  }

  return {
    label: 'Mensaje',
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
    throw new Error(result?.message || 'No pudimos cargar esta tarea.')
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
    throw new Error(result?.message || 'No pudimos subir el archivo.')
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
    throw new Error(result?.message || 'No pudimos quitar el archivo.')
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
    throw new Error(result?.message || 'No pudimos guardar tu entrega.')
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
  const url = safeText(attachment.url) ?? '#'
  const isImage = isImageAttachment(attachment)
  const AttachmentIcon = getAttachmentIcon(attachment)
  const rowClassName =
    cn('flex min-h-12 items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/60 px-3 py-2 shadow-[0_1px_1px_rgba(15,23,42,0.03)] transition-colors duration-200 ease-out hover:border-primary/25 hover:bg-primary/5 dark:bg-background/35 sm:min-h-11', studentUi.focus)

  if (isImage) {
    const preview = (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className={cn(
          'group block overflow-hidden rounded-xl border border-border/60 bg-background/50 transition-colors hover:border-primary/25 dark:bg-background/35',
          studentUi.focus,
        )}
      >
        <img
          src={url}
          alt={name}
          className="max-h-80 w-full bg-muted/20 object-contain transition-transform duration-200 group-hover:scale-[1.01]"
          loading="lazy"
        />
        <span className="flex items-center justify-between gap-3 border-t border-border/55 px-3 py-2">
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold leading-5 text-foreground">
              {name}
            </span>
            <span className="block text-xs text-muted-foreground">
              {size ?? attachment.contentType ?? 'Imagen'}
            </span>
          </span>
          <Download className="size-4 shrink-0 text-muted-foreground" />
        </span>
      </a>
    )

    if (!onRemove) return preview

    return (
      <div className="relative">
        {preview}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          disabled={removing}
          aria-label={`Quitar ${name}`}
          className="absolute right-2 top-2 bg-background/85 text-muted-foreground shadow-sm backdrop-blur transition-colors duration-200 ease-out hover:bg-destructive/10 hover:text-destructive dark:bg-background/70"
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

  const content = (
    <>
      <StudentIconContainer
        icon={AttachmentIcon}
        size="sm"
        className="size-10 rounded-lg border-transparent bg-primary/10 text-primary ring-1 ring-primary/10"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold leading-5 text-foreground">
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
        className="shrink-0 text-muted-foreground transition-colors duration-200 ease-out hover:bg-destructive/10 hover:text-destructive"
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

function TaskHeroMetaChip({
  icon: Icon,
  children,
  className,
}: {
  icon: ComponentType<{ className?: string }>
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/70 px-2.5 py-1 text-xs font-medium leading-5 text-muted-foreground dark:bg-background/35',
        className,
      )}
    >
      <Icon className="size-3.5" />
      {children}
    </span>
  )
}

function OpenPostSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="h-9 w-36 animate-pulse rounded-lg bg-muted/30" />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <article
          aria-hidden="true"
          className="rounded-2xl border border-border/60 bg-card/95 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.025)] dark:bg-card/90 sm:p-6"
        >
          <div className="flex gap-3">
            <div className="size-9 animate-pulse rounded-full bg-muted/45" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 animate-pulse rounded-md bg-muted/45" />
              <div className="h-3 w-28 animate-pulse rounded-md bg-muted/30" />
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <div className="h-8 w-2/3 animate-pulse rounded-md bg-muted/45" />
            <div className="h-4 w-full animate-pulse rounded-md bg-muted/25" />
            <div className="h-4 w-4/5 animate-pulse rounded-md bg-muted/25" />
          </div>
        </article>
        <div
          aria-hidden="true"
          className="h-44 animate-pulse rounded-xl border border-border/60 bg-muted/20"
        />
      </div>
    </div>
  )
}

function TeacherAvatarOrIcon({
  name,
  avatarUrl,
  icon: Icon,
  className,
}: {
  name: string | null
  avatarUrl?: string | null
  icon: ComponentType<{ className?: string }>
  className?: string
}) {
  if (name) {
    return (
      <UserAvatar
        name={name}
        avatarUrl={avatarUrl ?? null}
        size={36}
        className="mt-0.5 shrink-0"
        fallbackClassName="bg-primary/10 text-primary dark:bg-primary/15"
      />
    )
  }

  return (
    <StudentIconContainer
      icon={Icon}
      size="sm"
      className={cn('mt-0.5', className)}
    />
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
          error: error instanceof Error ? error.message : 'No pudimos abrir esta tarea.',
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
  const currentFeedback = currentDelivery?.feedbackVigente ?? null
  const feedbackEstado = getFeedbackEstado(currentFeedback)
  const feedbackComment = safeText(currentFeedback?.comentario)
  const feedbackNote = displayValue(currentFeedback?.nota)
  const feedbackDate = formatDateTime(currentFeedback?.fechaCorreccionUtc)
  const feedbackAttachments = currentFeedback?.adjuntos ?? []
  const isAnnouncement = isAnnouncementTask(task)
  const teacherName = getTeacherName(task)
  const announcementTeacherName = getAnnouncementTeacherName(task)
  const teacherAvatarUrl = getTeacherAvatarUrl(task)
  const feedbackTeacherName = getFeedbackTeacherName(currentFeedback, task)
  const feedbackTeacherAvatarUrl = getFeedbackTeacherAvatarUrl(currentFeedback, task)
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
  const saveButtonLabel = currentDelivery
    ? feedbackNeedsChanges
      ? 'Enviar corrección'
      : 'Guardar cambios'
    : 'Entregar tarea'
  const actionState = feedbackNeedsChanges
    ? {
        title: 'Tenés una mejora para hacer',
        description: 'Leé el mensaje de tu profe, ajustá tu trabajo y mandá una nueva versión.',
        cta: 'Mejorar entrega',
        icon: AlertCircle,
        iconClassName: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
        buttonClassName: 'bg-amber-600 text-white hover:bg-amber-700',
      }
    : feedbackApproved
      ? {
          title: 'Trabajo aprobado',
          description: 'Buen avance. Tu entrega ya fue revisada y podés volver a verla cuando quieras.',
          cta: 'Revisar entrega',
          icon: CheckCircle2,
          iconClassName:
            'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300',
          buttonClassName: '',
        }
      : currentDelivery
        ? {
            title: 'Entrega guardada',
            description: 'Ya completaste este paso. Podés revisar lo que mandaste o hacer un cambio.',
            cta: 'Editar entrega',
            icon: CheckCircle2,
            iconClassName:
              'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300',
            buttonClassName: '',
          }
        : task?.vencida
          ? {
              title: 'La fecha ya pasó',
              description: 'Repasá la consigna y hablá con tu profe si necesitás ayuda para ponerte al día.',
              cta: null,
              icon: AlertCircle,
              iconClassName: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
              buttonClassName: '',
            }
          : {
              title: 'Próximo paso: entregar',
              description: 'Leé la consigna, mirá los materiales y mandá tu trabajo cuando esté listo.',
              cta: 'Empezar entrega',
              icon: Clock3,
              iconClassName: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
              buttonClassName: '',
          }
  const ActionIcon = actionState.icon
  const heroCtaLabel = actionState.cta ?? 'Leer consigna'

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
        error instanceof Error ? error.message : 'No pudimos subir el archivo.'
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
        error instanceof Error ? error.message : 'No pudimos quitar el archivo.'
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
      setFormError('Escribí una respuesta o agregá un archivo para poder entregar.')
      return
    }

    setSaving(true)

    try {
      await saveDelivery(courseId, taskId, trimmedText, attachments)
      setSuccess('Listo, tu entrega quedó guardada.')
      router.refresh()
      router.push(`/student/courses/${courseId}`)
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'No pudimos guardar tu entrega.'
      )
    } finally {
      setSaving(false)
    }
  }

  function handleHeroAction() {
    if (actionState.cta) {
      if (feedbackApproved || (task?.vencida && !currentDelivery)) {
        setShowForm(false)
      } else {
        setShowForm(true)
      }
    }

    const targetId = actionState.cta ? 'tu-trabajo' : 'consigna'

    window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }

  function renderDeliveryPanel() {
    return (
      <section
        id="tu-trabajo"
        className={cn(
          'rounded-xl border bg-card/95 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.035)] dark:bg-card/90',
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
                ? 'Acá ves lo que mandaste y el mensaje de tu profe.'
                : 'Todavía no entregaste esta tarea.'}
            </p>
          </div>

          {currentDelivery ? (
            <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
              <StudentStatusBadge
                className={cn(
                  studentUi.badge.compact,
                  currentFeedback ? feedbackEstado.badgeClass : taskStatusClassName,
                )}
              >
                {currentFeedback ? feedbackEstado.label : 'Entregada'}
              </StudentStatusBadge>

              {feedbackApproved && feedbackNote ? (
                <span
                  className={cn(
                    'inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm font-semibold shadow-[0_1px_1px_rgba(15,23,42,0.04)]',
                    getGradeBadgeClass(currentFeedback?.nota),
                  )}
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wide opacity-75">
                    Nota
                  </span>
                  <span className="leading-none">{feedbackNote}</span>
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {currentFeedback ? (
          <div
            className={cn(
              'mt-5 rounded-xl border p-4',
              feedbackNeedsChanges
                ? 'border-amber-500/25 bg-amber-500/[0.06] dark:bg-amber-500/10'
                : 'border-emerald-500/20 bg-emerald-500/[0.06] dark:bg-emerald-500/10',
            )}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-2.5">
                <TeacherAvatarOrIcon
                  name={feedbackTeacherName}
                  avatarUrl={feedbackTeacherAvatarUrl}
                  icon={MessageSquareText}
                  className={feedbackEstado.iconClass}
                />
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold tracking-tight text-foreground">
                    {feedbackTeacherName
                      ? `${feedbackTeacherName} te dejó un mensaje`
                      : feedbackNeedsChanges
                        ? 'Tu profe pidió algunos cambios'
                        : 'Mensaje de tu profe'}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {feedbackDate ?? 'Sin fecha cargada'}
                  </p>
                </div>
              </div>

              {feedbackNote && !feedbackApproved ? (
                <span
                  className={cn(
                    'inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 shadow-[0_1px_1px_rgba(15,23,42,0.04)]',
                    getGradeBadgeClass(currentFeedback?.nota),
                  )}
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wide opacity-75">
                    Nota
                  </span>
                  <span className="text-lg font-semibold leading-none">
                    {feedbackNote}
                  </span>
                </span>
              ) : null}
            </div>

            {feedbackComment ? (
              <div className="mt-3 rounded-xl border border-background/70 bg-background/65 px-3.5 py-3 dark:border-white/10 dark:bg-background/25">
                <p className="whitespace-pre-wrap text-sm leading-6 text-foreground/85">
                  {feedbackComment}
                </p>
              </div>
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
        ) : currentDelivery ? (
          <p className="mt-5 rounded-xl border border-border/55 bg-background/45 px-3.5 py-3 text-sm text-muted-foreground dark:bg-background/25">
            Tu profe todavía no dejó un mensaje.
          </p>
        ) : null}

        {currentDelivery ? (
          <div className="mt-5 border-t border-border/60 pt-4">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <h3 className="font-semibold tracking-tight text-foreground">
                Tu entrega
              </h3>
              {deliveryDate ? (
                <>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">{deliveryDate}</span>
                </>
              ) : null}
            </div>

            {deliveryContent ? (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground/80">
                {deliveryContent}
              </p>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Entregaste archivos, sin texto escrito.
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
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-border/70 bg-muted/15 px-4 py-4 text-sm text-muted-foreground dark:bg-muted/10">
            Cuando entregues, acá vas a ver tu respuesta, tus archivos y el mensaje de tu profe.
          </div>
        )}

        {currentDelivery ? (
          <Button
            type="button"
            variant="outline"
            className={cn('mt-5 h-10 w-full sm:w-fit', studentUi.button.secondaryCta)}
            onClick={() => setShowForm((current) => !current)}
          >
            {showForm ? 'Cerrar edición' : feedbackNeedsChanges ? 'Enviar corrección' : 'Editar entrega'}
            <ChevronDown
              className={cn(
                'size-4 transition-transform duration-200 ease-out',
                showForm ? 'rotate-180' : '',
              )}
            />
          </Button>
        ) : null}

        {showForm ? (
          <div className="mt-4 space-y-2.5 rounded-xl border border-border/55 bg-background/45 p-3 animate-in fade-in-0 slide-in-from-top-1 duration-200 dark:bg-background/25">
            <Textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Escribí tu respuesta..."
              className="min-h-28 rounded-xl border-border/70 bg-card/80 text-base focus-visible:ring-primary/20 dark:bg-card/60"
            />

            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border/70 bg-card/55 px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors duration-200 ease-out hover:border-primary/30 hover:bg-primary/5 hover:text-primary focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/20 dark:bg-card/35 sm:justify-start">
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              Agregar archivo
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
            ) : null}

            {formError ? (
              <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-sm font-medium text-rose-700 dark:text-rose-400">
                {formError}
              </p>
            ) : null}

            {success ? (
              <p className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-800 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300">
                <CheckCircle2 className="size-4" />
                {success}
              </p>
            ) : null}

            <Button
              type="button"
              className="h-10 w-full rounded-lg sm:w-fit"
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
    return <OpenPostSkeleton />
  }

  if (state.error || !task) {
    return (
      <Card className="mx-auto max-w-2xl rounded-xl border border-border/60 bg-card/95 shadow-none dark:bg-card/90">
        <CardContent className="px-6 py-10 text-center">
          <StudentIconContainer
            icon={AlertCircle}
            className="mx-auto size-10 border-transparent bg-rose-500/10 text-rose-700 dark:text-rose-300"
          />
          <p className="text-sm font-medium text-muted-foreground">
            No pudimos abrir esta publicación.
          </p>
          <Button asChild variant="ghost" className={cn('mt-4', studentUi.button.ghost)}>
            <Link href={`/student/courses/${courseId}`}>Volver al tablón</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const taskContent = safeText(task.consigna) ?? safeText(task.descripcion)

  if (isAnnouncement) {
    return (
      <div className="mx-auto max-w-3xl space-y-3.5 sm:space-y-4">
        <Button
          asChild
          variant="ghost"
          className={cn('h-8 px-2 text-sm text-muted-foreground', studentUi.button.ghost)}
        >
          <Link href={`/student/courses/${courseId}`}>
            <ArrowLeft className="size-4" />
            Tablón
          </Link>
        </Button>

        <article className="rounded-2xl border border-violet-500/15 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.025)] dark:bg-card/90 sm:p-5">
          <header className="flex min-w-0 items-start gap-3">
            <TeacherAvatarOrIcon
              name={announcementTeacherName}
              avatarUrl={teacherAvatarUrl}
              icon={Megaphone}
              className="border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300"
            />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold leading-5 text-foreground">
                {announcementTeacherName ?? 'Profesor'}
              </p>
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                {['Anuncio', createdAt].filter(Boolean).join(' · ')}
              </p>
            </div>
          </header>

          <div className="mt-4 space-y-3">
            <h1 className="text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-[1.7rem]">
              {safeText(task.titulo) ?? 'Sin título'}
            </h1>

            <div className="text-base leading-7 text-foreground/85">
              {taskContent ? (
                <p className="whitespace-pre-wrap">
                  {taskContent}
                </p>
              ) : (
                <p className="text-muted-foreground">Este anuncio todavía no tiene texto.</p>
              )}
            </div>

            {resources.length > 0 ? (
              <div className="pt-1">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Paperclip className="size-4 text-muted-foreground" />
                  Recursos
                </div>
                <div className="space-y-2">
                  {resources.map((resource, index) => (
                    <AttachmentLink
                      key={resource.storageKey ?? resource.url ?? index}
                      attachment={resource}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </article>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-3.5 sm:space-y-4">
      <Button
        asChild
        variant="ghost"
        className={cn('h-8 px-2 text-sm text-muted-foreground', studentUi.button.ghost)}
      >
        <Link href={`/student/courses/${courseId}`}>
          <ArrowLeft className="size-4" />
          Tablón
        </Link>
      </Button>

      <div className="grid gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <article
          id="consigna"
          className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.025)] dark:bg-card/90 sm:p-5"
        >
          <header className="flex min-w-0 items-start gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <TeacherAvatarOrIcon
                name={teacherName === 'Profesor' ? null : teacherName}
                avatarUrl={teacherAvatarUrl}
                icon={BookOpen}
                className="border-primary/15 bg-primary/10 text-primary"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold leading-5 text-foreground">
                  {teacherName === 'Profesor' ? 'Profesor' : teacherName}
                </p>
                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                  {['Tarea', createdAt].filter(Boolean).join(' · ')}
                </p>
              </div>
            </div>
          </header>

          <div className="mt-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <h1 className="min-w-0 text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-[1.7rem]">
                {safeText(task.titulo) ?? 'Sin título'}
              </h1>

              {dueDate ? (
                <TaskHeroMetaChip
                  icon={CalendarCheck2}
                  className={cn(
                    'shrink-0',
                    task?.vencida && !currentDelivery
                      ? 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300'
                      : 'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300',
                  )}
                >
                  {task?.vencida && !currentDelivery ? `Venció ${dueDate}` : `Vence ${dueDate}`}
                </TaskHeroMetaChip>
              ) : null}
            </div>

            {taskContent ? (
              <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-foreground/85">
                {taskContent}
              </p>
            ) : (
              <p className={cn('mt-3', studentUi.card.callout)}>
                Esta tarea todavía no tiene consigna.
              </p>
            )}
          </div>

          {resources.length > 0 ? (
            <section className="mt-4 pt-1">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Paperclip className="size-4 text-muted-foreground" />
                Materiales
              </div>
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
        </article>

        <aside className="order-first space-y-3.5 lg:order-none lg:sticky lg:top-6">
          {!feedbackApproved && !feedbackNeedsChanges && (currentDelivery || task?.vencida) ? (
            <section className="rounded-xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.025)] dark:bg-card/90">
              <div className="flex items-start gap-3">
                <StudentIconContainer
                  icon={ActionIcon}
                  size="md"
                  className={actionState.iconClassName}
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold tracking-tight text-foreground">
                    {actionState.title}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {feedbackNeedsChanges
                      ? 'Una corrección es parte del aprendizaje: ajustá lo necesario y volvé a enviarla.'
                      : currentDelivery
                        ? 'Tu avance quedó guardado y podés editarlo si necesitás mejorar algo.'
                        : task?.vencida
                          ? 'Leé la consigna y hablá con tu profe si necesitás ponerte al día.'
                          : 'Leé la consigna, revisá los materiales y prepará tu entrega.'}
                  </p>
                </div>
              </div>

              <StudentStatusBadge
                icon={ActionIcon}
                className={cn('mt-4 rounded-lg px-2.5 py-1 text-xs', taskStatusClassName)}
              >
                {taskStatusLabel}
              </StudentStatusBadge>

              <Button
                type="button"
                className={cn(
                  'mt-4 h-10 w-full shrink-0 rounded-lg',
                  actionState.buttonClassName ||
                    'border-border/70 bg-background/75 text-foreground transition-colors duration-200 ease-out hover:border-primary/20 hover:bg-muted/40 hover:text-primary active:scale-[0.99] dark:bg-background/35',
                )}
                variant={actionState.buttonClassName ? 'default' : 'outline'}
                onClick={handleHeroAction}
              >
                {heroCtaLabel}
              </Button>
            </section>
          ) : null}

          {renderDeliveryPanel()}
        </aside>
      </div>
    </div>
  )
}
