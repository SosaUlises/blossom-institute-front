'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Loader2, RefreshCcw, Send, Star } from 'lucide-react'

import { FileUploadField } from '@/components/shared/file-upload-field'
import { Button } from '@/components/ui/button'
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

function StatusOption({
  active,
  title,
  icon: Icon,
  tone,
  onClick,
}: {
  active: boolean
  title: string
  icon: React.ComponentType<{ className?: string }>
  tone: 'success' | 'warning'
  onClick: () => void
}) {
  const activeClass =
    tone === 'success'
      ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
      : 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-400'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-10 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors ${
        active
          ? activeClass
          : 'border-border/60 bg-background/70 text-muted-foreground hover:bg-muted/30 hover:text-foreground'
      }`}
    >
      <Icon className="size-4" />
      {title}
    </button>
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
  const needsComment = !isAprobado
  const missingRequiredComment = needsComment && comentario.trim().length === 0

  useEffect(() => {
    if (!isAprobado && nota !== '') {
      setNota('')
    }
  }, [isAprobado, nota])

  const canSubmit = useMemo(
    () => !saving && !missingRequiredComment,
    [missingRequiredComment, saving],
  )

  const handleRemoveAttachment = (index: number) => {
    setAdjuntos((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      if (missingRequiredComment) {
        throw new Error('Agregá un comentario para pedir cambios.')
      }

      const parsedNota = isAprobado && nota.trim() ? Number(nota) : null

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

      setSuccess('Devolución enviada correctamente.')
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
    <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] sm:p-5">
      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Corrección</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
            Nueva devolución
          </h2>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Estado</label>
          <div className="grid grid-cols-2 gap-2">
            <StatusOption
              active={isAprobado}
              title="Aprobar"
              icon={CheckCircle2}
              tone="success"
              onClick={() => setEstado(String(EstadoCorreccion.Aprobado))}
            />
            <StatusOption
              active={!isAprobado}
              title="Pedir cambios"
              icon={RefreshCcw}
              tone="warning"
              onClick={() => setEstado(String(EstadoCorreccion.Rehacer))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="feedback-grade" className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Star className="size-4 text-muted-foreground" />
            Nota
          </label>
          <input
            id="feedback-grade"
            type="number"
            step="0.1"
            value={nota}
            onChange={(event) => setNota(event.target.value)}
            disabled={!isAprobado}
            className={`h-10 w-full rounded-lg border px-3 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 ${
              isAprobado
                ? 'border-border/60 bg-background/75'
                : 'cursor-not-allowed border-border/50 bg-muted/25 text-muted-foreground'
            }`}
            placeholder={isAprobado ? 'Ej. 85' : 'No aplica al pedir cambios'}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="feedback-comment" className="text-sm font-medium text-foreground">
            Comentario
          </label>
          <textarea
            id="feedback-comment"
            value={comentario}
            onChange={(event) => setComentario(event.target.value)}
            rows={6}
            className="w-full resize-none rounded-xl border border-border/60 bg-background/75 px-3 py-2.5 text-sm leading-6 outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
            placeholder={
              isAprobado
                ? 'Escribí una devolución para el alumno...'
                : 'Indicá con claridad qué debe corregir...'
            }
          />
          {missingRequiredComment ? (
            <p className="text-xs text-amber-700 dark:text-amber-400">
              El comentario es obligatorio para pedir cambios.
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Adjuntos</label>
          <FileUploadField
            folder="feedbacks"
            multiple
            values={adjuntos}
            onUploadedMany={setAdjuntos}
            onRemoveAt={handleRemoveAttachment}
            label="Adjuntar archivos"
            helperText="Adjuntos opcionales · Máx. 20 MB"
            compact
          />
        </div>

        {error ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
            {success}
          </div>
        ) : null}

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="h-10 w-full rounded-lg px-4 shadow-none"
        >
          {saving ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Send className="mr-2 size-4" />
          )}
          {saving ? 'Enviando...' : 'Enviar devolución'}
        </Button>
      </div>
    </section>
  )
}
