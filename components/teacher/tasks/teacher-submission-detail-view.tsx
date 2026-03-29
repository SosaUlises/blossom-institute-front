'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CalendarClock,
  FileText,
  Link as LinkIcon,
  Paperclip,
  Star,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/teacher/course-detail/formatters'
import { getTeacherSubmissionDetail, getTeacherSubmissionFeedbacks } from '@/lib/teacher/tasks/feedback-api'
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

type EnvelopeError = {
  message?: string
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
      <section className="relative overflow-hidden rounded-[30px] border border-border/70 bg-card/95 p-6 shadow-[0_24px_60px_-28px_rgba(30,42,68,0.24)] md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.10),transparent_32%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_28%)]" />

        <div className="relative space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="outline"
              className="rounded-2xl"
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
            <div className="rounded-[24px] border border-border/70 bg-background/80 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarClock className="size-4" />
                <span className="text-xs font-medium uppercase tracking-[0.14em]">
                  Fecha de entrega
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground">
                {formatDateTime(detail.fechaEntregaUtc)}
              </p>
            </div>

            <div className="rounded-[24px] border border-border/70 bg-background/80 p-4 shadow-sm">
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

            <div className="rounded-[24px] border border-border/70 bg-background/80 p-4 shadow-sm">
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

      <section className="rounded-[28px] border border-border/70 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(30,42,68,0.18)]">
        <div className="mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Submission
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
            Texto de la entrega
          </h2>
        </div>

        <div className="rounded-[24px] border border-border/70 bg-background/75 p-4">
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
      </section>

      {detail.adjuntos.length > 0 && (
        <section className="rounded-[28px] border border-border/70 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(30,42,68,0.18)]">
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Attachments
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
              Adjuntos de la entrega
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {detail.adjuntos.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-[22px] border border-border/70 bg-background/75 p-4 transition hover:bg-background"
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
        </section>
      )}

      {detail.feedbackVigente && (
        <section className="rounded-[28px] border border-border/70 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(30,42,68,0.18)]">
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Current feedback
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
              Feedback vigente
            </h2>
          </div>

          <div className="rounded-[24px] border border-border/70 bg-background/75 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${feedbackEstado.className}`}
              >
                {feedbackEstado.label}
              </span>

              {detail.feedbackVigente.nota != null && (
                <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  Nota: {detail.feedbackVigente.nota}
                </span>
              )}
            </div>

            <p className="mt-3 text-sm text-muted-foreground">
              Última corrección: {formatDateTime(detail.feedbackVigente.fechaCorreccionUtc)}
            </p>
          </div>
        </section>
      )}

      <TeacherFeedbackForm
        courseId={courseId}
        taskId={taskId}
        alumnoId={alumnoId}
        onCreated={loadAll}
      />

      <section className="rounded-[28px] border border-border/70 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(30,42,68,0.18)]">
        <div className="mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            History
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
            Historial de feedbacks
          </h2>
        </div>

        {!feedbacks || feedbacks.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no hay feedbacks cargados.</p>
        ) : (
          <div className="space-y-4">
            {feedbacks.items.map((item) => {
              const config = getEstadoCorreccionConfig(item.estado)

              return (
                <article
                  key={item.feedbackId}
                  className="rounded-[24px] border border-border/70 bg-background/75 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${config.className}`}
                    >
                      {config.label}
                    </span>

                    {item.esVigente && (
                      <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        Vigente
                      </span>
                    )}

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
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}