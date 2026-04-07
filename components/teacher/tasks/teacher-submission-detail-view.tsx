'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CalendarClock,
  Link as LinkIcon,
  Paperclip,
  Star,
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
    return (
      <div className="rounded-[24px] border border-border/60 bg-background/60 px-6 py-10 text-sm text-muted-foreground">
        Cargando entrega...
      </div>
    )
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
      <div className="rounded-[24px] border border-border/60 bg-background/60 px-6 py-10 text-sm text-muted-foreground">
        No se encontró la entrega.
      </div>
    )
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

      <section className="rounded-[28px] border border-border/60 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
        <div className="mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Submission
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
            Texto de la entrega
          </h2>
        </div>

        <div className="rounded-[24px] border border-border/60 bg-background/75 p-4">
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
        <section className="rounded-[28px] border border-border/60 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
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
                  <p className="truncate font-medium text-foreground">{attachment.nombre}</p>
                  <p className="text-sm text-muted-foreground">
                    {attachment.tipo === 1 ? 'Link' : 'Archivo'}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      <TeacherFeedbackForm
        courseId={courseId}
        taskId={taskId}
        alumnoId={alumnoId}
        onCreated={loadAll}
      />

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
        ) : (
          <div className="space-y-4">
            {feedbacks.items.map((item) => {
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