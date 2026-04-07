'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'

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

  const handleRemoveAttachment = (index: number) => {
    setAdjuntos((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const payload: CreateFeedbackPayload = {
        estado: Number(estado),
        nota: nota.trim() ? Number(nota) : null,
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
      <div className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Feedback
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
          Crear feedback
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Estado</label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="flex h-11 w-full rounded-2xl border border-border/70 bg-background/85 px-3 py-2 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] outline-none transition-all duration-200 focus:ring-4 focus:ring-primary/15"
          >
            <option value={EstadoCorreccion.Aprobado}>Aprobado</option>
            <option value={EstadoCorreccion.Rehacer}>Rehacer</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Nota</label>
          <input
            type="number"
            step="0.1"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            className="h-11 w-full rounded-2xl border border-border/70 bg-background/85 px-4 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] outline-none transition-all duration-200 focus:ring-4 focus:ring-primary/15"
            placeholder="Ej. 80"
          />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <label className="text-sm font-medium text-foreground">Comentario</label>
        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          rows={4}
          className="w-full rounded-2xl border border-border/70 bg-background/85 px-4 py-3 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] outline-none transition-all duration-200 focus:ring-4 focus:ring-primary/15"
          placeholder="Escribí observaciones, correcciones o devolución para el alumno..."
        />
      </div>

      <div className="mt-4 space-y-2">
        <label className="text-sm font-medium text-foreground">Archivos corregidos</label>

        <FileUploadField
          folder="feedbacks"
          multiple
          values={adjuntos}
          onUploadedMany={setAdjuntos}
          onRemoveAt={handleRemoveAttachment}
          label="Subir archivos"
        />
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-600 dark:text-green-400">
          {success}
        </div>
      )}

      <div className="mt-5 flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={saving}
          className="rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg active:translate-y-0 active:shadow-md"
        >
          <Save className="mr-2 size-4" />
          {saving ? 'Guardando...' : 'Guardar feedback'}
        </Button>
      </div>
    </section>
  )
}