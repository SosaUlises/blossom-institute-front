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
  PlusCircle,
  ChevronRight,
  Inbox,
  History,
  User,
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
import type {
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
      ? 'rounded-[24px] border border-primary/15 bg-primary/5 px-4 py-4 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-primary/[0.07] hover:shadow-md'
      : tone === 'success'
        ? 'rounded-[24px] border border-emerald-500/20 bg-emerald-500/[0.10] px-4 py-4 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-emerald-500/[0.14] hover:shadow-md'
        : tone === 'warning'
          ? 'rounded-[24px] border border-amber-500/20 bg-amber-500/[0.10] px-4 py-4 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-amber-500/[0.14] hover:shadow-md'
          : 'rounded-[24px] border border-border/60 bg-background/75 px-4 py-4 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-background hover:shadow-md'

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
      <div className={`flex items-center gap-2 ${muted ? 'text-muted-foreground/80' : 'text-muted-foreground'}`}>
        <Paperclip className="size-4" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
          {title}
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {attachments.map((attachment) => (
          <a
            key={attachment.id}
            href={attachment.url}
            target="_blank"
            rel="noreferrer"
            className={`group flex items-center gap-4 rounded-[24px] border p-5 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md ${
              muted
                ? 'border-border/50 bg-muted/30 hover:bg-muted/40'
                : 'border-border/60 bg-background/75 hover:bg-background'
            }`}
          >
            <div
              className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${
                muted ? 'bg-background/80 text-muted-foreground' : 'bg-primary/10 text-primary'
              }`}
            >
              {attachment.tipo === 1 ? (
                <LinkIcon className="size-4.5" />
              ) : (
                <Paperclip className="size-4.5" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {attachment.nombre || 'Adjunto'}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
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
    <article className="rounded-[26px] border border-border/50 bg-muted/30 p-5 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-muted/40 hover:shadow-md">
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

        <div className="rounded-[24px] border border-border/50 bg-background/70 p-4">
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
      <section className="rounded-[28px] border border-border/60 bg-card/95 p-6 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.18)] md:p-8">
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
            <div className="h-24 animate-pulse rounded-[24px] bg-muted/30" />
            <div className="h-24 animate-pulse rounded-[24px] bg-muted/30" />
            <div className="h-24 animate-pulse rounded-[24px] bg-muted/30" />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <section className="rounded-[28px] border border-border/60 bg-card/95 p-6">
          <div className="space-y-4">
            <div className="h-4 w-24 animate-pulse rounded bg-muted/30" />
            <div className="h-7 w-48 animate-pulse rounded-lg bg-muted/35" />
            <div className="h-40 animate-pulse rounded-[24px] bg-muted/30" />
          </div>
        </section>

        <section className="rounded-[28px] border border-border/60 bg-card/95 p-6">
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateFeedback, setShowCreateFeedback] = useState(false)

  const loadAll = async () => {
    try {
      setLoading(true)
      setError(null)

      const [detailResult, feedbackResult] = await Promise.all([
        getTeacherSubmissionDetail(courseId, taskId, alumnoId),
        getTeacherSubmissionFeedbacks(courseId, taskId, alumnoId),
      ])

      setDetail(detailResult)
      setFeedbacks(feedbackResult)
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
      <div className="rounded-[24px] border border-destructive/20 bg-destructive/5 px-6 py-5 text-sm text-destructive">
        {error}
      </div>
    )
  }

  if (!detail) {
    return (
      <Card className="rounded-[28px] border border-border/60 bg-card/95 shadow-[0_18px_40px_-22px_rgba(15,23,42,0.16)]">
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

  const feedbackTone =
    feedbackEstado.label?.toLowerCase().includes('aprob') ? 'success' : 'warning'

  const vigenteTone =
    vigenteFeedbackConfig?.label?.toLowerCase().includes('aprob') ? 'success' : 'warning'

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[28px] border border-border/60 bg-card/95 p-6 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.18)] md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.08),transparent_32%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.06),transparent_28%)]" />

        <div className="relative space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="outline"
              className="rounded-2xl border-border/70 bg-background/70 transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
              onClick={() => router.push(`/teacher/courses/${courseId}/tasks/${taskId}`)}
            >
              <ArrowLeft className="mr-2 size-4" />
              Volver a la tarea
            </Button>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${entregaEstado.className}`}
              >
                {entregaEstado.label}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Detalle de la entrega
            </p>

            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {detail.alumnoNombre} {detail.alumnoApellido}
            </h1>

            <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-[15px]">
              Revisá la entrega, sus adjuntos, el feedback vigente y el historial completo de correcciones para decidir la próxima acción docente.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <DetailMetaCard
              icon={Star}
              label="Estado de corrección"
              value={feedbackEstado.label}
              tone={feedbackTone}
            />

            <DetailMetaCard
              icon={CalendarClock}
              label="Fecha de entrega"
              value={detail.fechaEntregaUtc ? formatDateTime(detail.fechaEntregaUtc) : '-'}
            />

            <DetailMetaCard
              icon={Paperclip}
              label="Adjuntos"
              value={`${detail.adjuntos.length} adjunto${detail.adjuntos.length === 1 ? '' : 's'}`}
              tone={detail.adjuntos.length > 0 ? 'highlight' : 'default'}
            />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <section className="rounded-[28px] border border-border/60 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
          <div className="mb-5 space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Entrega
            </p>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Contenido entregado
            </h2>
          </div>

          <div className="space-y-5">
            <div className="rounded-[24px] border border-border/60 bg-background/75 p-5 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-background hover:shadow-md">
              <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                <FileText className="size-4" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                  Texto de la entrega
                </span>
              </div>

              {detail.texto?.trim() ? (
                <p className="whitespace-pre-wrap text-sm leading-7 text-foreground">
                  {detail.texto}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  El alumno no dejó texto en la entrega.
                </p>
              )}
            </div>

            <AttachmentGrid
              title="Adjuntos de la entrega"
              attachments={detail.adjuntos}
            />
          </div>
        </section>

        <section className="rounded-[28px] border border-border/60 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
          <div className="space-y-5">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Acción docente
              </p>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Corregir entrega
              </h2>
            </div>

            <div className="rounded-[24px] border border-border/60 bg-background/75 p-5 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)] transition-all duration-200 hover:bg-background hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <PlusCircle className="size-4.5" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    Registrar nueva corrección
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Creá un feedback para actualizar el estado, dejar observaciones y adjuntar archivos corregidos si hace falta.
                  </p>
                </div>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => setShowCreateFeedback((prev) => !prev)}
              className="h-11 rounded-2xl bg-primary px-5 text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg active:translate-y-0 active:shadow-md"
            >
              <PlusCircle className="mr-2 size-4" />
              {showCreateFeedback ? 'Ocultar formulario' : 'Crear feedback'}
            </Button>
          </div>
        </section>
      </div>

      {showCreateFeedback && (
        <TeacherFeedbackForm
          courseId={courseId}
          taskId={taskId}
          alumnoId={alumnoId}
          onCreated={async () => {
            await loadAll()
            setShowCreateFeedback(false)
          }}
        />
      )}

      {vigenteFeedback && (
        <section className="rounded-[28px] border border-primary/15 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
          <div className="mb-5 space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/80">
              Feedback vigente
            </p>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Corrección actual
            </h2>
          </div>

          <article className="rounded-[24px] border border-primary/15 bg-primary/5 p-5 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)]">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {vigenteFeedback.nota != null && (
                <div className="rounded-[22px] border border-emerald-500/20 bg-emerald-500/[0.08] px-4 py-4 shadow-[0_10px_20px_-18px_rgba(16,185,129,0.45)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-emerald-500/[0.12] hover:shadow-md">
                  
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700/80 dark:text-emerald-400/90">
                    Calificación
                  </p>


                    <p className="text-2xl font-semibold tracking-tight text-emerald-700 dark:text-emerald-400 text-center">
                      {vigenteFeedback.nota}
                    </p>

                </div>
              )}
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${vigenteFeedbackConfig?.className ?? ''}`}
                >
                  {vigenteFeedbackConfig?.label}
                </span>

                <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  Vigente
                </span>

              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <DetailMetaCard
                  icon={CalendarClock}
                  label="Corrección"
                  value={formatDateTime(vigenteFeedback.fechaCorreccionUtc)}
                  tone="highlight"
                />
                <DetailMetaCard
                  icon={Star}
                  label="Estado"
                  value={vigenteFeedbackConfig?.label ?? '-'}
                  tone={vigenteTone}
                />
                <DetailMetaCard
                  icon={Paperclip}
                  label="Adjuntos"
                  value={
                    vigenteFeedback.adjuntos?.length
                      ? `${vigenteFeedback.adjuntos.length} adjunto${vigenteFeedback.adjuntos.length === 1 ? '' : 's'}`
                      : 'Sin adjuntos'
                  }
                  tone={vigenteFeedback.adjuntos?.length ? 'highlight' : 'default'}
                />
              </div>

              <div className="rounded-[24px] border border-primary/15 bg-card/70 p-4">
                <div className="mb-3 flex items-center gap-2 text-primary/80">
                  <MessageSquare className="size-4" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                    Comentario
                  </span>
                </div>

                <p className="whitespace-pre-wrap text-sm leading-7 text-foreground">
                  {vigenteFeedback.comentario?.trim()
                    ? vigenteFeedback.comentario
                    : 'Sin comentario.'}
                </p>
              </div>

              <FeedbackAttachmentList attachments={vigenteFeedback.adjuntos} />
            </div>
          </article>
        </section>
      )}

      <section className="rounded-[28px] border border-border/60 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
        <div className="mb-5 space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Historial
          </p>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Historial de feedbacks
          </h2>
        </div>

        {!feedbacks || feedbacks.items.length === 0 ? (
          <Card className="rounded-[28px] border border-border/60 bg-background/50 shadow-none">
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
          <div className="rounded-[24px] border border-dashed border-border/70 bg-muted/20 px-6 py-10 text-center text-sm text-muted-foreground">
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