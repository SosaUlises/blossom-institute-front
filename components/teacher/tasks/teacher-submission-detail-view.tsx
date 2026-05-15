'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CalendarClock,
  FileText,
  Link as LinkIcon,
  Paperclip,
  Star,
  MessageSquare,
  ChevronRight,
  Inbox,
  History,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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

function DetailMetaCard({
  icon: Icon,
  label,
  value,
  tone = 'default',
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  tone?: 'default' | 'highlight' | 'success' | 'warning'
}) {
  const containerClass =
    tone === 'highlight'
      ? 'rounded-2xl border border-primary/15 bg-primary/5 px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] transition-all duration-200 hover:bg-primary/[0.07] hover:shadow-md'
      : tone === 'success'
        ? 'rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.10] px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] transition-all duration-200 hover:bg-emerald-500/[0.14] hover:shadow-md'
        : tone === 'warning'
          ? 'rounded-2xl border border-amber-500/20 bg-amber-500/[0.10] px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] transition-all duration-200 hover:bg-amber-500/[0.14] hover:shadow-md'
          : 'rounded-2xl border border-border/60 bg-background/75 px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] transition-all duration-200 hover:bg-background hover:shadow-md'

  const iconWrapClass =
    tone === 'highlight'
      ? 'bg-primary/10 text-primary'
      : tone === 'success'
        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
        : tone === 'warning'
          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
          : 'bg-background text-muted-foreground'

  const labelClass =
    tone === 'highlight'
      ? 'text-primary/80'
      : tone === 'success'
        ? 'text-emerald-700/80 dark:text-emerald-400/90'
        : tone === 'warning'
          ? 'text-amber-700/80 dark:text-amber-400/90'
          : 'text-muted-foreground'

  const valueClass =
    tone === 'highlight'
      ? 'text-primary'
      : tone === 'success'
        ? 'text-emerald-700 dark:text-emerald-400'
        : tone === 'warning'
          ? 'text-amber-700 dark:text-amber-400'
          : 'text-foreground'

  return (
    <div className={containerClass}>
      <div className="flex items-center gap-2">
        <div className={`flex size-9 items-center justify-center rounded-2xl ${iconWrapClass}`}>
          <Icon className="size-4" />
        </div>
        <span className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${labelClass}`}>
          {label}
        </span>
      </div>

      <p className={`mt-3 text-sm font-semibold leading-6 ${valueClass}`}>{value}</p>
    </div>
  )
}

function AttachmentGrid({
  title,
  attachments,
  muted = false,
}: {
  title: string
  attachments: Array<{
    id: number
    tipo: number
    url: string
    nombre?: string | null
  }>
  muted?: boolean
}) {
  if (attachments.length === 0) return null

  return (
    <div className="space-y-3">
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
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/65 px-2.5 py-1 text-xs font-medium text-muted-foreground dark:bg-background/35">
      <Icon className="size-3.5" />
      {children}
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
      title="Adjuntos del feedback"
      attachments={attachments}
      muted={muted}
    />
  )
}

function FeedbackHistoryItem({
  item,
}: {
  item: NonNullable<TeacherSubmissionFeedbacksResponse['items']>[number]
}) {
  const config = getEstadoCorreccionConfig(item.estado)
  const itemTone =
    config.label?.toLowerCase().includes('aprob') ? 'success' : 'warning'

  return (
    <article className="rounded-2xl border border-border/50 bg-muted/30 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.035)] transition-all duration-200 hover:bg-muted/40 hover:shadow-md">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${config.className}`}
          >
            {config.label}
          </span>

          {item.nota != null && (
            <span className="inline-flex rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
              Nota: {item.nota}
            </span>
          )}

          <span className="inline-flex rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
            Historial
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <DetailMetaCard
            icon={CalendarClock}
            label="Corrección"
            value={formatDateTime(item.fechaCorreccionUtc)}
          />
          <DetailMetaCard
            icon={Star}
            label="Estado"
            value={config.label}
            tone={itemTone}
          />
          <DetailMetaCard
            icon={Paperclip}
            label="Adjuntos"
            value={
              item.adjuntos?.length
                ? `${item.adjuntos.length} adjunto${item.adjuntos.length === 1 ? '' : 's'}`
                : 'Sin adjuntos'
            }
          />
        </div>

        <div className="rounded-2xl border border-border/50 bg-background/70 p-4">
          <div className="mb-3 flex items-center gap-2 text-muted-foreground">
            <MessageSquare className="size-4" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
              Comentario
            </span>
          </div>

          <p className="whitespace-pre-wrap text-sm leading-7 text-foreground">
            {item.comentario?.trim() ? item.comentario : 'Sin comentario.'}
          </p>
        </div>

        <FeedbackAttachmentList attachments={item.adjuntos} muted />
      </div>
    </article>
  )
}

function SubmissionDetailSkeleton() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border/60 bg-card/95 p-6 shadow-[0_1px_2px_rgba(15,23,42,0.035)] md:p-8">
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="h-10 w-40 animate-pulse rounded-2xl bg-muted/35" />
            <div className="flex gap-2">
              <div className="h-7 w-24 animate-pulse rounded-full bg-muted/35" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="h-4 w-28 animate-pulse rounded-lg bg-muted/30" />
            <div className="h-9 w-2/5 animate-pulse rounded-xl bg-muted/40" />
            <div className="h-4 w-4/5 animate-pulse rounded-lg bg-muted/30" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="h-24 animate-pulse rounded-2xl bg-muted/30" />
            <div className="h-24 animate-pulse rounded-2xl bg-muted/30" />
            <div className="h-24 animate-pulse rounded-2xl bg-muted/30" />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <section className="rounded-2xl border border-border/60 bg-card/95 p-6">
          <div className="space-y-4">
            <div className="h-4 w-24 animate-pulse rounded bg-muted/30" />
            <div className="h-7 w-48 animate-pulse rounded-lg bg-muted/35" />
            <div className="h-40 animate-pulse rounded-2xl bg-muted/30" />
          </div>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card/95 p-6">
          <div className="space-y-4">
            <div className="h-4 w-24 animate-pulse rounded bg-muted/30" />
            <div className="h-7 w-48 animate-pulse rounded-lg bg-muted/35" />
            <div className="h-11 w-full animate-pulse rounded-2xl bg-muted/30" />
          </div>
        </section>
      </div>
    </div>
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
              <EmptyTitle>No se encontró la entrega</EmptyTitle>
              <EmptyDescription>
                La entrega del alumno no está disponible.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    )
  }

  const entregaEstado = getEstadoEntregaConfig(detail.estadoEntrega)
  const feedbackEstado = getEstadoCorreccionConfig(detail.feedbackVigente?.estado)
  const vigenteFeedbackConfig = vigenteFeedback
    ? getEstadoCorreccionConfig(vigenteFeedback.estado)
    : null

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
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${entregaEstado.className}`}
            >
              {entregaEstado.label}
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${feedbackEstado.className}`}
            >
              {feedbackEstado.label}
            </span>
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {detail.alumnoNombre} {detail.alumnoApellido}
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
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
        <div className="min-w-0 space-y-5">
          <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] sm:p-5">
            <div className="mb-4 flex items-center gap-2 border-b border-border/60 pb-3">
              <FileText className="size-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Respuesta del alumno
              </h2>
            </div>

            <div className="space-y-5">
              {detail.texto?.trim() ? (
                <p className="whitespace-pre-wrap text-base leading-8 text-foreground/85">
                  {detail.texto}
                </p>
              ) : (
                <p className="rounded-xl border border-dashed border-border/70 bg-muted/15 px-4 py-3 text-sm leading-6 text-muted-foreground dark:bg-muted/10">
                  El alumno no dejó texto en la entrega.
                </p>
              )}

              <AttachmentGrid
                title="Adjuntos de la entrega"
                attachments={detail.adjuntos}
              />
            </div>
          </section>

          {vigenteFeedback && (
            <section className="rounded-2xl border border-primary/15 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] sm:p-5">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-border/60 pb-3">
                <div>
                  <p className="text-xs font-medium text-primary">Feedback vigente</p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                    Última devolución
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${vigenteFeedbackConfig?.className ?? ''}`}
                  >
                    {vigenteFeedbackConfig?.label}
                  </span>
                  {vigenteFeedback.nota != null ? (
                    <span className="inline-flex rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      Nota {vigenteFeedback.nota}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <InlineMetaChip icon={CalendarClock}>
                    {formatDateTime(vigenteFeedback.fechaCorreccionUtc)}
                  </InlineMetaChip>
                  <InlineMetaChip icon={Paperclip}>
                    {vigenteFeedback.adjuntos?.length
                      ? `${vigenteFeedback.adjuntos.length} adjunto${vigenteFeedback.adjuntos.length === 1 ? '' : 's'}`
                      : 'Sin adjuntos'}
                  </InlineMetaChip>
                </div>

                <div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
                  <div className="mb-2 flex items-center gap-2 text-primary/80">
                    <MessageSquare className="size-4" />
                    <span className="text-xs font-medium">Comentario</span>
                  </div>

                  <p className="whitespace-pre-wrap text-sm leading-7 text-foreground">
                    {vigenteFeedback.comentario?.trim()
                      ? vigenteFeedback.comentario
                      : 'Sin comentario.'}
                  </p>
                </div>

                <FeedbackAttachmentList attachments={vigenteFeedback.adjuntos} />
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6">
          <TeacherFeedbackForm
            courseId={courseId}
            taskId={taskId}
            alumnoId={alumnoId}
            onCreated={() => loadAll(false)}
          />
        </aside>
      </div>

      <section className="rounded-2xl border border-border/60 bg-card/95 p-6 shadow-[0_1px_2px_rgba(15,23,42,0.035)]">
        <div className="mb-5 space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Historial
          </p>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Historial de feedbacks
          </h2>
        </div>

        {!feedbacks || feedbacks.items.length === 0 ? (
          <Card className="rounded-2xl border border-border/60 bg-background/50 shadow-none">
            <CardContent className="px-6 py-14">
              <Empty className="border-0 p-0">
                <EmptyMedia variant="icon">
                  <History />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>Sin feedbacks</EmptyTitle>
                  <EmptyDescription>
                    Todavía no hay feedbacks cargados para esta entrega.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </CardContent>
          </Card>
        ) : previousFeedbacks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-10 text-center text-sm text-muted-foreground">
            No hay feedbacks anteriores para mostrar.
          </div>
        ) : (
          <div className="space-y-4">
            {previousFeedbacks.map((item) => (
              <FeedbackHistoryItem key={item.feedbackId} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
