'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { createTeacherSubmissionFeedback } from '@/lib/teacher/tasks/feedback-api'
import { EstadoCorreccion, type CreateFeedbackPayload } from '@/lib/teacher/tasks/feedback-types'

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
  const [archivoCorregidoUrl, setArchivoCorregidoUrl] = useState('')
  const [archivoCorregidoNombre, setArchivoCorregidoNombre] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const payload: CreateFeedbackPayload = {
        estado: Number(estado),
        nota: nota.trim() ? Number(nota) : null,
        comentario: comentario.trim() || null,
        archivoCorregidoUrl: archivoCorregidoUrl.trim() || null,
        archivoCorregidoNombre: archivoCorregidoNombre.trim() || null,
      }

      await createTeacherSubmissionFeedback(courseId, taskId, alumnoId, payload)

      setSuccess('Feedback creado correctamente.')
      setComentario('')
      setNota('')
      setArchivoCorregidoUrl('')
      setArchivoCorregidoNombre('')

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
    <section className="rounded-[28px] border border-border/70 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(30,42,68,0.18)]">
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
            className="flex h-11 w-full rounded-2xl border border-border/70 bg-background/80 px-3 py-2 text-sm shadow-sm outline-none"
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
            className="h-11 w-full rounded-2xl border border-border/70 bg-background/80 px-4 text-sm outline-none"
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
          className="w-full rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm outline-none"
          placeholder="Escribí observaciones, correcciones o devolución para el alumno..."
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            URL archivo corregido
          </label>
          <input
            value={archivoCorregidoUrl}
            onChange={(e) => setArchivoCorregidoUrl(e.target.value)}
            className="h-11 w-full rounded-2xl border border-border/70 bg-background/80 px-4 text-sm outline-none"
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Nombre archivo corregido
          </label>
          <input
            value={archivoCorregidoNombre}
            onChange={(e) => setArchivoCorregidoNombre(e.target.value)}
            className="h-11 w-full rounded-2xl border border-border/70 bg-background/80 px-4 text-sm outline-none"
            placeholder="correccion-final.pdf"
          />
        </div>
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
        <Button onClick={handleSubmit} disabled={saving} className="rounded-2xl">
          <Save className="mr-2 size-4" />
          {saving ? 'Guardando...' : 'Guardar feedback'}
        </Button>
      </div>
    </section>
  )
}