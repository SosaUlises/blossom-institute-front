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
  CheckCircle2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
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

function FeedbackAttachmentList({
  attachments,
}: {
  attachments?: Array<{
    id: number
    tipo: number
    url: string
    nombre?: string | null
  }>
}) {
  if (!attachments || attachments.length === 0) return null

  return (
    <div className="mt-4 space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Adjuntos del feedback
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        {attachments.map((attachment) => (
          <a
            key={attachment.id}
            href={attachment.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-[20px] border border-border/60 bg-background/80 p-4 transition-all duration-200 hover:-translate-y-[1px] hover:bg-background hover:shadow-sm"
          >
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {attachment.tipo === 1 ? (
                <LinkIcon className="size-4.5" />
              ) : (
                <Paperclip className="size-4.5" />
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">
                {attachment.nombre || 'Adjunto'}
              </p>
              <p className="text-sm text-muted-foreground">
                {attachment.tipo === 1 ? 'Link' : 'Archivo'}
              </p>
            </div>
          </a>
        ))}
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
    [feedbacks]
  )

  const previousFeedbacks = useMemo(
    () => feedbacks?.items.filter((item) => !item.esVigente) ?? [],
    [feedbacks]
  )

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando entrega...</p>
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>
  }

  if (!detail) {
    return <p className="text-sm text-muted-foreground">No se encontró la entrega.</p>
  }

  const entregaEstado = getEstadoEntregaConfig(detail.estadoEntrega)
  const feedbackEstado = getEstadoCorreccionConfig(detail.feedbackVigente?.estado)

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[28px] border border-border/60 bg-card/95 p-6 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.18)] md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.08),transparent_32%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.06),transparent_28%)]" />

        <div className="relative space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="outline"
              className="rounded-2xl border-border/70 bg-background/70 transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
              onClick={() => router.push(`/teacher/courses/${courseId}/tasks/${taskId}`)}
            >
              <ArrowLeft className="mr-2 size-4" />
              Volver a la tarea
            </Button>

            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${entregaEstado.className}`}
              >
                {entregaEstado.label}
              </span>

              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${feedbackEstado.className}`}
              >
                {feedbackEstado.label}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Star className="size-3.5" />
              Submission detail
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Entrega del alumno
            </h1>

            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              Revisá la entrega, los adjuntos, el feedback vigente y el historial completo de correcciones.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-[24px] border border-border/60 bg-background/80 p-4 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)]">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarClock className="size-4" />
                <span className="text-xs font-medium uppercase tracking-[0.14em]">
                  Fecha de entrega
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground">
                {detail.fechaEntregaUtc ? formatDateTime(detail.fechaEntregaUtc) : '-'}
              </p>
            </div>

            <div className="rounded-[24px] border border-border/60 bg-background/80 p-4 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)]">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Paperclip className="size-4" />
                <span className="text-xs font-medium uppercase tracking-[0.14em]">
                  Adjuntos
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground">
                {detail.adjuntos.length}
              </p>
            </div>

            <div className="rounded-[24px] border border-border/60 bg-background/80 p-4 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)]">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Star className="size-4" />
                <span className="text-xs font-medium uppercase tracking-[0.14em]">
                  Feedbacks
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground">
                {feedbacks?.total ?? 0}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <section className="rounded-[28px] border border-border/60 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Submission
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
              Entrega del alumno
            </h2>
          </div>

          <div className="space-y-5">
            <div className="rounded-[24px] border border-border/60 bg-background/75 p-4">
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

            {detail.adjuntos.length > 0 && (
              <div>
                <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                  <Paperclip className="size-4" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                    Adjuntos de la entrega
                  </span>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {detail.adjuntos.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-[22px] border border-border/60 bg-background/75 p-4 transition-all duration-200 hover:-translate-y-[1px] hover:bg-background hover:shadow-sm"
                    >
                      <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        {attachment.tipo === 1 ? (
                          <LinkIcon className="size-4.5" />
                        ) : (
                          <Paperclip className="size-4.5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {attachment.nombre}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {attachment.tipo === 1 ? 'Link' : 'Archivo'}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[28px] border border-border/60 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Teacher action
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                Corregir entrega
              </h2>
            </div>

            <div className="rounded-[24px] border border-border/60 bg-background/75 p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <MessageSquare className="size-4.5" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    Acción principal
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Registrá un nuevo feedback para actualizar el estado de corrección y dejar una devolución.
                  </p>
                </div>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => setShowCreateFeedback((prev) => !prev)}
              className="h-11 rounded-2xl bg-primary/90 px-5 text-primary-foreground shadow-[0_14px_30px_-18px_rgba(36,59,123,0.42)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-primary hover:shadow-[0_18px_36px_-18px_rgba(36,59,123,0.50)]"
            >
              <PlusCircle className="mr-2 size-4" />
              {showCreateFeedback ? 'Ocultar formulario' : 'Crear feedback'}
            </Button>

            {!showCreateFeedback && vigenteFeedback && (
              <div className="rounded-[24px] border border-primary/15 bg-primary/5 p-4">
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle2 className="size-4" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                    Feedback vigente
                  </span>
                </div>

                <p className="mt-3 text-sm font-semibold text-foreground">
                  {vigenteFeedback.nota != null ? `Nota actual: ${vigenteFeedback.nota}` : 'Sin nota registrada'}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {formatDateTime(vigenteFeedback.fechaCorreccionUtc)}
                </p>
              </div>
            )}
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
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/80">
              Current feedback
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
              Feedback vigente
            </h2>
          </div>

          <article className="rounded-[24px] border border-primary/15 bg-primary/5 p-5 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)]">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getEstadoCorreccionConfig(vigenteFeedback.estado).className}`}
              >
                {getEstadoCorreccionConfig(vigenteFeedback.estado).label}
              </span>

              <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Vigente
              </span>

              {vigenteFeedback.nota != null && (
                <span className="inline-flex rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
                  Nota: {vigenteFeedback.nota}
                </span>
              )}
            </div>

            <p className="mt-3 text-sm text-muted-foreground">
              {formatDateTime(vigenteFeedback.fechaCorreccionUtc)}
            </p>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-foreground">
              {vigenteFeedback.comentario?.trim() ? vigenteFeedback.comentario : 'Sin comentario.'}
            </p>

            <FeedbackAttachmentList attachments={vigenteFeedback.adjuntos} />
          </article>
        </section>
      )}

      <section className="rounded-[28px] border border-border/60 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
        <div className="mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Feedback history
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
            Historial de feedbacks
          </h2>
        </div>

        {!feedbacks || feedbacks.items.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-border/70 bg-background/60 px-6 py-10 text-center text-sm text-muted-foreground">
            Todavía no hay feedbacks cargados.
          </div>
        ) : previousFeedbacks.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-border/70 bg-background/60 px-6 py-10 text-center text-sm text-muted-foreground">
            No hay feedbacks anteriores para mostrar.
          </div>
        ) : (
          <div className="space-y-4">
            {previousFeedbacks.map((item) => {
              const config = getEstadoCorreccionConfig(item.estado)

              return (
                <article
                  key={item.feedbackId}
                  className="rounded-[24px] border border-border/60 bg-background/75 p-4 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)]"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${config.className}`}
                    >
                      {config.label}
                    </span>

                    {item.nota != null && (
                      <span className="inline-flex rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                        Nota: {item.nota}
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-sm text-muted-foreground">
                    {formatDateTime(item.fechaCorreccionUtc)}
                  </p>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-foreground">
                    {item.comentario?.trim() ? item.comentario : 'Sin comentario.'}
                  </p>

                  <FeedbackAttachmentList attachments={item.adjuntos} />
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}