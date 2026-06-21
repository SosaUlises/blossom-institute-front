'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CalendarClock,
  FileText,
  Link as LinkIcon,
  Paperclip,
  MessageSquare,
  ChevronRight,
  Inbox,
  History,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PersonAvatar } from '@/components/teacher/course-detail/course-people-ui'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { formatDateTime } from '@/lib/teacher/course-detail/formatters'
import {
  getTeacherSubmissionDetail,
  getTeacherSubmissionFeedbacks,
} from '@/lib/teacher/tasks/feedback-api'
import { getTeacherTaskDetail } from '@/lib/teacher/tasks/task-api'
import type {
  TeacherTaskDetail,
  TeacherSubmissionDetail,
  TeacherSubmissionFeedbacksResponse,
} from '@/lib/teacher/tasks/types'
import { getEstadoCorreccionConfig } from '@/lib/teacher/tasks/feedback-utils'
import { getEstadoEntregaConfig } from '@/lib/teacher/tasks/utils'
import { TeacherFeedbackForm } from './teacher-feedback-form'

type Props = {
  courseId: number
  taskId: number
  alumnoId: number
}

function AttachmentGrid({
  title,
  attachments,
  muted = false,
  emptyLabel,
  showTitle = true,
  subtleEmpty = false,
}: {
  title: string
  attachments: Array<{
    id: number
    tipo: number
    url: string
    nombre?: string | null
  }>
  muted?: boolean
  emptyLabel?: string
  showTitle?: boolean
  subtleEmpty?: boolean
}) {
  return (
    <div className="space-y-3">
      {showTitle ? (
        <div
          className={`flex items-center gap-2 ${
            muted ? 'text-muted-foreground/80' : 'text-muted-foreground'
          }`}
        >
          <Paperclip className="size-4" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
            {title}
          </span>
        </div>
      ) : null}

      {attachments.length === 0 ? (
        <p
          className={
            subtleEmpty
              ? 'text-sm text-muted-foreground'
              : 'rounded-xl border border-dashed border-border/70 bg-muted/15 px-3 py-2.5 text-sm text-muted-foreground dark:bg-muted/10'
          }
        >
          {emptyLabel ?? 'Sin adjuntos.'}
        </p>
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment) => (
          <a
            key={attachment.id}
            href={attachment.url}
            target="_blank"
            rel="noreferrer"
            className={`group flex min-h-12 min-w-0 items-center gap-3 rounded-xl border px-3 py-2 transition-colors duration-200 ${
              muted
                ? 'border-border/50 bg-muted/20 hover:bg-muted/30'
                : 'border-border/60 bg-background/60 hover:border-primary/25 hover:bg-primary/5 dark:bg-background/35'
            }`}
          >
            <div
              className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                muted
                  ? 'bg-background/80 text-muted-foreground'
                  : 'bg-primary/10 text-primary'
              }`}
            >
              {attachment.tipo === 1 ? (
                <LinkIcon className="size-4" />
              ) : (
                <Paperclip className="size-4" />
              )}
            </div>

            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="truncate text-sm font-semibold leading-5 text-foreground">
                {attachment.nombre || 'Adjunto'}
              </p>
              <p className="text-xs text-muted-foreground">
                {attachment.tipo === 1 ? 'Link externo' : 'Archivo adjunto'}
              </p>
            </div>

            <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
          ))}
        </div>
      )}
    </div>
  )
}

function InlineMetaChip({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <span className="inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-full border border-border/60 bg-background/65 px-2.5 py-1 text-xs font-medium text-muted-foreground dark:bg-background/35">
      <Icon className="size-3.5 shrink-0" />
      <span className="min-w-0 truncate">{children}</span>
    </span>
  )
}

function FeedbackAttachmentList({
  attachments,
  muted = false,
}: {
  attachments?: Array<{
    id: number
    tipo: number
    url: string
    nombre?: string | null
  }>
  muted?: boolean
}) {
  if (!attachments || attachments.length === 0) return null

  return (
    <AttachmentGrid
      title="Adjuntos de la devolución"
      attachments={attachments}
      muted={muted}
    />
  )
}

function FeedbackCommentPreview({ comment }: { comment?: string | null }) {
  const [expanded, setExpanded] = useState(false)
  const trimmedComment = comment?.trim() ?? ''
  const isLong = trimmedComment.length > 180
  const visibleComment =
    !expanded && isLong ? `${trimmedComment.slice(0, 180).trim()}...` : trimmedComment

  return (
    <div className="space-y-2">
      <p className="break-words whitespace-pre-wrap text-sm leading-6 text-foreground">
        {visibleComment || 'Sin comentario.'}
      </p>
      {isLong ? (
        <button
          type="button"
          className="text-xs font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? 'Ver menos' : 'Ver comentario completo'}
        </button>
      ) : null}
    </div>
  )
}

function FeedbackTimelineItem({
  item,
  current = false,
}: {
  item: NonNullable<TeacherSubmissionFeedbacksResponse['items']>[number]
  current?: boolean
}) {
  const config = getEstadoCorreccionConfig(item.estado)

  return (
    <article className="relative pl-6">
      <span
        className={`absolute left-0 top-5 flex size-4 items-center justify-center rounded-full border ${
          current
            ? 'border-primary/30 bg-primary/15'
            : 'border-border bg-background'
        }`}
      >
        <span className={`size-1.5 rounded-full ${current ? 'bg-primary' : 'bg-muted-foreground/60'}`} />
      </span>

      <div
        className={`space-y-3 rounded-2xl border p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] ${
          current
            ? 'border-primary/20 bg-primary/[0.045] dark:bg-primary/[0.08]'
            : 'border-border/55 bg-background/55 dark:bg-background/35'
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          {current ? (
            <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              Última devolución
            </span>
          ) : null}
          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${config.className}`}>
            {config.label}
          </span>
          {item.nota != null ? (
            <span className="inline-flex rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground">
              Nota {item.nota}
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <InlineMetaChip icon={CalendarClock}>
            {formatDateTime(item.fechaCorreccionUtc)}
          </InlineMetaChip>
          <InlineMetaChip icon={Paperclip}>
            {item.adjuntos?.length
              ? `${item.adjuntos.length} adjunto${item.adjuntos.length === 1 ? '' : 's'}`
              : 'Sin adjuntos'}
          </InlineMetaChip>
        </div>

        <div className="border-l-2 border-border/60 pl-3">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <MessageSquare className="size-4" />
            <span className="text-xs font-medium">Comentario</span>
          </div>
          <FeedbackCommentPreview comment={item.comentario} />
        </div>

        <FeedbackAttachmentList attachments={item.adjuntos} muted={!current} />
      </div>
    </article>
  )
}

function SubmissionDetailSkeleton() {
  return (
    <>
      <p className="sr-only" role="status" aria-live="polite">
        Cargando entrega.
      </p>
      <div aria-hidden="true" className="space-y-5">
        <header className="space-y-3 border-b border-border/60 pb-4">
          <div className="h-8 w-36 animate-pulse rounded-lg bg-muted/35" />
          <div className="flex items-center gap-3">
            <div className="size-10 animate-pulse rounded-full bg-muted/40" />
            <div className="h-8 w-48 animate-pulse rounded-lg bg-muted/40" />
          </div>
        </header>
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="h-44 animate-pulse rounded-xl border border-border/60 bg-muted/20" />
          <div className="h-64 animate-pulse rounded-xl border border-border/60 bg-muted/20" />
        </div>
      </div>
    </>
  )
}

export function TeacherSubmissionDetailView({
  courseId,
  taskId,
  alumnoId,
}: Props) {
  const router = useRouter()

  const [detail, setDetail] = useState<TeacherSubmissionDetail | null>(null)
  const [feedbacks, setFeedbacks] = useState<TeacherSubmissionFeedbacksResponse | null>(null)
  const [task, setTask] = useState<TeacherTaskDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAll = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      setError(null)

      const [detailResult, feedbackResult, taskResult] = await Promise.all([
        getTeacherSubmissionDetail(courseId, taskId, alumnoId),
        getTeacherSubmissionFeedbacks(courseId, taskId, alumnoId),
        getTeacherTaskDetail(courseId, taskId),
      ])

      setDetail(detailResult)
      setFeedbacks(feedbackResult)
      setTask(taskResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [courseId, taskId, alumnoId])

  const vigenteFeedback = useMemo(
    () => feedbacks?.items.find((item) => item.esVigente) ?? null,
    [feedbacks],
  )

  const previousFeedbacks = useMemo(
    () => feedbacks?.items.filter((item) => !item.esVigente) ?? [],
    [feedbacks],
  )

  if (loading) {
    return <SubmissionDetailSkeleton />
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-5 text-sm text-destructive">
        {error}
      </div>
    )
  }

  if (!detail) {
    return (
      <Card className="rounded-2xl border border-border/60 bg-card/95 shadow-[0_1px_2px_rgba(15,23,42,0.035)]">
        <CardContent className="px-6 py-14">
          <Empty className="border-0 p-0">
            <EmptyMedia variant="icon">
              <Inbox />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No se encontró esta entrega</EmptyTitle>
              <EmptyDescription>
                Puede haber cambiado o ya no estar disponible.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    )
  }

  const entregaEstado = getEstadoEntregaConfig(detail.estadoEntrega)
  const feedbackEstado = getEstadoCorreccionConfig(detail.feedbackVigente?.estado)
  const hasFeedback = Boolean(detail.feedbackVigente)
  const alumnoName = `${detail.alumnoNombre ?? ''} ${detail.alumnoApellido ?? ''}`.trim() || 'Alumno'
  return (
    <div className="space-y-5">
      <header className="space-y-4 border-b border-border/60 pb-4">
        <Button
          variant="ghost"
          className="h-9 w-fit justify-start rounded-lg px-2 text-muted-foreground hover:text-foreground"
          onClick={() => router.push(`/teacher/courses/${courseId}/tasks/${taskId}`)}
        >
          <ArrowLeft className="mr-2 size-4" />
          Volver a la tarea
        </Button>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {entregaEstado.label}
            </span>
            {hasFeedback ? (
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${feedbackEstado.className}`}
              >
                {feedbackEstado.label}
              </span>
            ) : (
              <span className="text-xs font-medium text-primary">
                Pendiente de feedback
              </span>
            )}
          </div>

          <div className="flex min-w-0 items-start gap-3">
            <PersonAvatar
              name={alumnoName}
              avatarUrl={detail.alumnoAvatarUrl}
              tone="student"
            />
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {alumnoName}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <InlineMetaChip icon={FileText}>
                  {task?.titulo ?? 'Tarea'}
                </InlineMetaChip>
                <InlineMetaChip icon={CalendarClock}>
                  Entregada {formatDateTime(detail.fechaEntregaUtc)}
                </InlineMetaChip>
                <InlineMetaChip icon={Paperclip}>
                  {detail.adjuntos.length === 1
                    ? '1 adjunto'
                    : `${detail.adjuntos.length} adjuntos`}
                </InlineMetaChip>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
        <aside className="order-1 space-y-4 xl:order-2 xl:sticky xl:top-6">
          <TeacherFeedbackForm
            courseId={courseId}
            taskId={taskId}
            alumnoId={alumnoId}
            onCreated={() => loadAll(false)}
          />
        </aside>

        <div className="order-2 min-w-0 space-y-5 xl:order-1">
          <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] sm:p-5">
            <div className="mb-4 flex items-center gap-2 border-b border-border/60 pb-3">
              <FileText className="size-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Respuesta del alumno
              </h2>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Texto enviado</p>
                <div className="border-l-2 border-border/60 pl-4">
                  {detail.texto?.trim() ? (
                    <p className="max-w-3xl break-words whitespace-pre-wrap text-[15px] leading-7 text-foreground/90">
                      {detail.texto}
                    </p>
                  ) : (
                    <p className="text-sm leading-6 text-muted-foreground">
                      El alumno no escribió una respuesta.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2 border-t border-border/60 pt-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Archivos adjuntos
                </p>
                <AttachmentGrid
                  title="Archivos adjuntos"
                  attachments={detail.adjuntos}
                  emptyLabel="No adjuntó archivos."
                  showTitle={false}
                  subtleEmpty
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] sm:p-5">
            <div className="mb-4 flex items-center gap-2 border-b border-border/60 pb-3">
              <History className="size-4 text-muted-foreground" />
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  Historial de devoluciones
                </h2>
                <p className="text-sm text-muted-foreground">
                  {feedbacks?.items.length
                    ? `${feedbacks.items.length} devolución${feedbacks.items.length === 1 ? '' : 'es'}`
                    : 'Sin feedback enviado'}
                </p>
              </div>
            </div>

            {!feedbacks || feedbacks.items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/70 bg-muted/15 px-4 py-6 text-sm text-muted-foreground dark:bg-muted/10">
                Todavía no enviaste una devolución para esta entrega.
              </div>
            ) : (
              <div className="relative space-y-3 before:absolute before:bottom-5 before:left-[7px] before:top-5 before:w-px before:bg-border/70">
                {vigenteFeedback ? (
                  <FeedbackTimelineItem item={vigenteFeedback} current />
                ) : null}
                {previousFeedbacks.map((item) => (
                  <FeedbackTimelineItem key={item.feedbackId} item={item} />
                ))}
              </div>
            )}
          </section>
        </div>

      </div>

    </div>
  )
}
