'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  FileText,
  RefreshCcw,
  Save,
  Star,
  Upload,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FileUploadField } from '@/components/shared/file-upload-field'
import { createTeacherSubmissionFeedback } from '@/lib/teacher/tasks/feedback-api'
import {
  EstadoCorreccion,
  type CreateFeedbackPayload,
} from '@/lib/teacher/tasks/feedback-types'
import type { UploadedFileResult } from '@/lib/uploads/api'

type Props = {
  courseId: number
  taskId: number
  alumnoId: number
  onCreated?: () => Promise<void> | void
}

function FeedbackStatusCard({
  selected,
  title,
  description,
  icon: Icon,
  onClick,
  tone,
}: {
  selected: boolean
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  tone: 'success' | 'warning'
}) {
  const activeClasses =
    tone === 'success'
      ? 'border-emerald-500/25 bg-emerald-500/[0.10] shadow-[0_16px_30px_-22px_rgba(16,185,129,0.45)]'
      : 'border-amber-500/25 bg-amber-500/[0.10] shadow-[0_16px_30px_-22px_rgba(245,158,11,0.40)]'

  const iconClasses =
    tone === 'success'
      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
      : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'

  const badgeClasses =
    tone === 'success'
      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
      : 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[24px] border p-4 text-left transition-all duration-200 ${
        selected
          ? `${activeClasses} -translate-y-[1px]`
          : 'border-border/60 bg-background/75 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)] hover:-translate-y-[1px] hover:bg-background hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${iconClasses}`}>
          <Icon className="size-4.5" />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            {selected && (
              <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${badgeClasses}`}>
                Seleccionado
              </span>
            )}
          </div>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </button>
  )
}

function FormMetaCard({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: string
  tone?: 'default' | 'success' | 'warning' | 'highlight'
}) {
  const containerClass =
    tone === 'highlight'
      ? 'rounded-[24px] border border-primary/15 bg-primary/5 px-4 py-4 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)]'
      : tone === 'success'
        ? 'rounded-[24px] border border-emerald-500/20 bg-emerald-500/[0.08] px-4 py-4 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)]'
        : tone === 'warning'
          ? 'rounded-[24px] border border-amber-500/20 bg-amber-500/[0.08] px-4 py-4 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)]'
          : 'rounded-[24px] border border-border/60 bg-background/75 px-4 py-4 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)]'

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
    <div className={`${containerClass} transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md`}>
      <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${labelClass}`}>
        {label}
      </p>
      <p className={`mt-3 text-sm font-semibold ${valueClass}`}>{value}</p>
    </div>
  )
}

export function TeacherFeedbackForm({
  courseId,
  taskId,
  alumnoId,
  onCreated,
}: Props) {
  const [estado, setEstado] = useState(String(EstadoCorreccion.Aprobado))
  const [nota, setNota] = useState('')
  const [comentario, setComentario] = useState('')
  const [adjuntos, setAdjuntos] = useState<UploadedFileResult[]>([])

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const isAprobado = Number(estado) === EstadoCorreccion.Aprobado
  const statusTone = isAprobado ? 'success' : 'warning'

  useEffect(() => {
    if (!isAprobado && nota !== '') {
      setNota('')
    }
  }, [isAprobado, nota])

  const notaPreview = isAprobado
    ? nota.trim() || 'Sin nota'
    : 'No aplica para rehacer'

  const comentarioPreview = comentario.trim()
    ? 'Comentario cargado'
    : 'Sin comentario todavía'

  const archivosPreview =
    adjuntos.length === 0
      ? 'Sin adjuntos'
      : `${adjuntos.length} archivo${adjuntos.length === 1 ? '' : 's'} cargado${adjuntos.length === 1 ? '' : 's'}`

  const canSubmit = useMemo(() => !saving, [saving])

  const handleRemoveAttachment = (index: number) => {
    setAdjuntos((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const parsedNota =
        isAprobado && nota.trim() ? Number(nota) : null

      if (parsedNota != null && Number.isNaN(parsedNota)) {
        throw new Error('La nota ingresada no es válida.')
      }

      const payload: CreateFeedbackPayload = {
        estado: Number(estado),
        nota: parsedNota,
        comentario: comentario.trim() || null,
        adjuntos: adjuntos.map((file) => ({
          tipo: 2,
          url: file.url,
          nombre: file.nombre,
          storageProvider: file.storageProvider ?? null,
          storageKey: file.storageKey ?? null,
          contentType: file.contentType ?? null,
          sizeBytes: file.sizeBytes ?? null,
        })),
      }

      await createTeacherSubmissionFeedback(courseId, taskId, alumnoId, payload)

      setSuccess('Feedback creado correctamente.')
      setComentario('')
      setNota('')
      setAdjuntos([])
      setEstado(String(EstadoCorreccion.Aprobado))

      if (onCreated) {
        await onCreated()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rounded-[28px] border border-border/60 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
      <div className="mb-6 space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Feedback
        </p>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Crear feedback
        </h2>
      </div>

      <div className="space-y-6">
        <div className="rounded-[24px] border border-border/60 bg-background/75 p-5 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)]">
          <div className="mb-4">
            <p className="text-sm font-semibold text-foreground">
              Elegí el resultado de la corrección
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              El estado define si la entrega queda aprobada o si necesita una nueva versión con ajustes.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <FeedbackStatusCard
              selected={isAprobado}
              title="Aprobado"
              description="La entrega cumple con lo esperado. Podés registrar una nota y dejar una devolución final."
              icon={CheckCircle2}
              tone="success"
              onClick={() => setEstado(String(EstadoCorreccion.Aprobado))}
            />

            <FeedbackStatusCard
              selected={!isAprobado}
              title="Rehacer"
              description="La entrega necesita cambios. Usá el comentario para indicar con claridad qué debe corregirse."
              icon={RefreshCcw}
              tone="warning"
              onClick={() => setEstado(String(EstadoCorreccion.Rehacer))}
            />
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <div
              className={`rounded-[24px] border p-5 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md ${
                isAprobado
                  ? 'border-emerald-500/20 bg-emerald-500/[0.05]'
                  : 'border-amber-500/20 bg-amber-500/[0.05]'
              }`}
            >
              <div
                className={`mb-3 flex items-center gap-2 ${
                  isAprobado
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-amber-700 dark:text-amber-400'
                }`}
              >
                <Star className="size-4" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                  Nota
                </span>
              </div>

              <input
                type="number"
                step="0.1"
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                disabled={!isAprobado}
                className={`h-11 w-full rounded-2xl border px-4 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] outline-none transition-all duration-200 focus:ring-4 focus:ring-primary/15 ${
                  isAprobado
                    ? 'border-border/70 bg-background/85'
                    : 'cursor-not-allowed border-border/60 bg-muted/40 text-muted-foreground'
                }`}
                placeholder={isAprobado ? 'Ej. 80' : 'No disponible para rehacer'}
              />

              <p className="mt-2 text-xs text-muted-foreground">
                {isAprobado
                  ? 'Escribe una nota numérica para esta entrega. Rango de 0 a 100, con hasta un decimal.'
                  : 'Cuando la entrega queda en rehacer, no se permite registrar una nota.'}
              </p>
            </div>

            <div
              className={`rounded-[24px] border p-5 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md ${
                isAprobado
                  ? 'border-emerald-500/20 bg-emerald-500/[0.05]'
                  : 'border-amber-500/20 bg-amber-500/[0.05]'
              }`}
            >
              <div
                className={`mb-3 flex items-center gap-2 ${
                  isAprobado
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-amber-700 dark:text-amber-400'
                }`}
              >
                <FileText className="size-4" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                  Comentario
                </span>
              </div>

              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={5}
                className="w-full rounded-2xl border border-border/70 bg-background/85 px-4 py-3 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] outline-none transition-all duration-200 focus:ring-4 focus:ring-primary/15"
                placeholder={
                  isAprobado
                    ? 'Escribí una devolución final para el alumno...'
                    : 'Indicá con claridad qué debe corregir o rehacer el alumno...'
                }
              />

              <p className="mt-2 text-xs text-muted-foreground">
                {isAprobado
                  ? 'Usalo para reforzar lo positivo y dejar observaciones finales.'
                  : 'Acá conviene ser específico para que el alumno entienda exactamente qué tiene que mejorar.'}
              </p>
            </div>

            <div
              className={`rounded-[24px] border p-5 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md ${
                isAprobado
                  ? 'border-emerald-500/20 bg-emerald-500/[0.05]'
                  : 'border-amber-500/20 bg-amber-500/[0.05]'
              }`}
            >
              <div
                className={`mb-3 flex items-center gap-2 ${
                  isAprobado
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-amber-700 dark:text-amber-400'
                }`}
              >
                <Upload className="size-4" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                  Archivos corregidos
                </span>
              </div>

              <FileUploadField
                folder="feedbacks"
                multiple
                values={adjuntos}
                onUploadedMany={setAdjuntos}
                onRemoveAt={handleRemoveAttachment}
                label="Subir archivos"
              />

              <p className="mt-2 text-xs text-muted-foreground">
                Adjuntá devoluciones, archivos corregidos o material complementario si necesitás ampliar el feedback.
              </p>
            </div>
          </div>

          <aside className="space-y-4">
            <div
              className={`rounded-[24px] border p-5 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)] ${
                isAprobado
                  ? 'border-emerald-500/20 bg-emerald-500/[0.08]'
                  : 'border-amber-500/20 bg-amber-500/[0.08]'
              }`}
            >
              <p
                className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
                  isAprobado
                    ? 'text-emerald-700/80 dark:text-emerald-400/90'
                    : 'text-amber-700/80 dark:text-amber-400/90'
                }`}
              >
                Vista previa
              </p>

              <h3 className="mt-1 text-sm font-semibold text-foreground">
                Resumen del feedback
              </h3>

              <div className="mt-4 grid gap-3">
                <FormMetaCard
                  label="Estado"
                  value={isAprobado ? 'Aprobado' : 'Rehacer'}
                  tone={statusTone}
                />
                <FormMetaCard
                  label="Nota"
                  value={notaPreview}
                  tone={isAprobado ? 'default' : 'warning'}
                />
                <FormMetaCard label="Comentario" value={comentarioPreview} />
                <FormMetaCard label="Adjuntos" value={archivosPreview} />
              </div>
            </div>

            <div className="rounded-[24px] border border-border/60 bg-background/75 p-5 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-background hover:shadow-md">
              <p className="text-sm font-semibold text-foreground">
                Recomendación
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {isAprobado
                  ? 'Usá “Aprobado” cuando la entrega ya esté cerrada y quieras dejar una devolución final.'
                  : 'Usá “Rehacer” cuando necesites pedir una nueva versión y quieras dejar indicaciones concretas de mejora.'}
              </p>
            </div>
          </aside>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-600 dark:text-green-400">
            {success}
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg active:translate-y-0 active:shadow-md"
          >
            <Save className="mr-2 size-4" />
            {saving ? 'Guardando...' : 'Guardar feedback'}
          </Button>
        </div>
      </div>
    </section>
  )
}