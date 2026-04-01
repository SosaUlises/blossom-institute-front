'use client'

import { useMemo, useState } from 'react'
import {
  CalendarDays,
  Percent,
  Plus,
  Save,
  Trash2,
  Trophy,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { GradeFormPayload, GradeFormValues } from '@/lib/teacher/grades/types'
import {
  calculateGradeFromSkills,
  requiresDirectNote,
  skillOptions,
  supportsSkills,
  tipoCalificacionOptions,
} from '@/lib/teacher/grades/utils'

type Props = {
  mode: 'create' | 'edit'
  initialValues?: Partial<GradeFormValues>
  onSubmit: (payload: GradeFormPayload) => Promise<void>
  submitLabel?: string
}

function createEmptyDetail() {
  return {
    id: crypto.randomUUID(),
    skill: '',
    puntajeObtenido: '',
    puntajeMaximo: '',
  }
}

export function TeacherGradeForm({
  mode,
  initialValues,
  onSubmit,
  submitLabel,
}: Props) {
  const [tipo, setTipo] = useState(initialValues?.tipo ?? '')
  const [titulo, setTitulo] = useState(initialValues?.titulo ?? '')
  const [descripcion, setDescripcion] = useState(initialValues?.descripcion ?? '')
  const [fecha, setFecha] = useState(initialValues?.fecha ?? '')
  const [nota, setNota] = useState(initialValues?.nota ?? '')
  const [detalles, setDetalles] = useState(
    initialValues?.detalles?.length ? initialValues.detalles : [createEmptyDetail()]
  )

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const tipoNumber = Number(tipo || 0)
  const useSkills = supportsSkills(tipoNumber)
  const useDirectNote = requiresDirectNote(tipoNumber)

  const calculatedGrade = useMemo(() => {
    const parsed = detalles
      .filter((item) => item.skill && item.puntajeMaximo && item.puntajeObtenido)
      .map((item) => ({
        puntajeObtenido: Number(item.puntajeObtenido),
        puntajeMaximo: Number(item.puntajeMaximo),
      }))

    if (!parsed.length) return 0
    return calculateGradeFromSkills(parsed)
  }, [detalles])

  const getSelectedSkills = (currentId?: string) => {
    return detalles
      .filter((item) => item.id !== currentId && item.skill)
      .map((item) => item.skill)
  }

  const hasDuplicateSkills = () => {
    const selected = detalles.map((item) => item.skill).filter(Boolean)
    return new Set(selected).size !== selected.length
  }

  const handleAddDetail = () => {
    setDetalles((prev) => [...prev, createEmptyDetail()])
  }

  const handleRemoveDetail = (id: string) => {
    setDetalles((prev) => prev.filter((item) => item.id !== id))
  }

  const handleChangeDetail = (
    id: string,
    field: 'skill' | 'puntajeObtenido' | 'puntajeMaximo',
    value: string
  ) => {
    setDetalles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  const handleSubmit = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      if (!tipo) throw new Error('El tipo es obligatorio.')
      if (!titulo.trim()) throw new Error('El título es obligatorio.')
      if (!fecha) throw new Error('La fecha es obligatoria.')

      if (useSkills && hasDuplicateSkills()) {
        throw new Error(
          'No se puede repetir la misma skill dentro de una misma calificación.'
        )
      }

      const payload: GradeFormPayload = {
        tipo: Number(tipo),
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || null,
        fecha,
        tareaId: null,
        entregaId: null,
        nota: useSkills
          ? null
          : nota.trim()
          ? Number(nota)
          : null,
        detalles: useSkills
          ? detalles
              .filter(
                (item) =>
                  item.skill &&
                  item.puntajeObtenido !== '' &&
                  item.puntajeMaximo !== ''
              )
              .map((item) => ({
                skill: Number(item.skill),
                puntajeObtenido: Number(item.puntajeObtenido),
                puntajeMaximo: Number(item.puntajeMaximo),
              }))
          : [],
      }

      await onSubmit(payload)
      setSuccess(
        mode === 'create'
          ? 'Calificación creada correctamente.'
          : 'Calificación actualizada correctamente.'
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-border/70 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(30,42,68,0.18)]">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="flex h-11 w-full rounded-2xl border border-border/70 bg-background/80 px-3 py-2 text-sm shadow-sm outline-none"
            >
              <option value="">Seleccionar tipo</option>
              {tipoCalificacionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Fecha</label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="h-11 w-full rounded-2xl border border-border/70 bg-background/80 pl-10 pr-4 text-sm outline-none"
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-foreground">Título</label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="h-11 w-full rounded-2xl border border-border/70 bg-background/80 px-4 text-sm outline-none"
              placeholder="Ej. Quiz Unit 3, Participation March, Test Midterm..."
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-foreground">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm outline-none"
              placeholder="Detalle opcional de la evaluación..."
            />
          </div>
        </div>
      </section>

      {useDirectNote && (
        <section className="rounded-[28px] border border-border/70 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(30,42,68,0.18)]">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Nota</label>
            <div className="relative">
              <Percent className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="number"
                step="0.01"
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                className="h-11 w-full rounded-2xl border border-border/70 bg-background/80 pl-10 pr-4 text-sm outline-none"
                placeholder="0 - 100"
              />
            </div>
          </div>
        </section>
      )}

      {useSkills && (
        <section className="rounded-[28px] border border-border/70 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(30,42,68,0.18)]">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Skills
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                Detalle por skills
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Cada skill solo puede usarse una vez por calificación.
              </p>
            </div>

            <Button variant="outline" className="rounded-2xl" onClick={handleAddDetail}>
              <Plus className="mr-2 size-4" />
              Agregar skill
            </Button>
          </div>

          <div className="space-y-4">
            {detalles.map((detail) => (
              <div
                key={detail.id}
                className="rounded-[24px] border border-border/70 bg-background/75 p-4"
              >
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Skill</label>
                    <select
                      value={detail.skill}
                      onChange={(e) =>
                        handleChangeDetail(detail.id, 'skill', e.target.value)
                      }
                      className="flex h-11 w-full rounded-2xl border border-border/70 bg-background/80 px-3 py-2 text-sm shadow-sm outline-none"
                    >
                      <option value="">Seleccionar skill</option>
                      {skillOptions
                        .filter(
                          (option) =>
                            option.value === detail.skill ||
                            !getSelectedSkills(detail.id).includes(option.value)
                        )
                        .map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Puntaje obtenido
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={detail.puntajeObtenido}
                      onChange={(e) =>
                        handleChangeDetail(detail.id, 'puntajeObtenido', e.target.value)
                      }
                      className="h-11 w-full rounded-2xl border border-border/70 bg-background/80 px-4 text-sm outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Puntaje máximo
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={detail.puntajeMaximo}
                      onChange={(e) =>
                        handleChangeDetail(detail.id, 'puntajeMaximo', e.target.value)
                      }
                      className="h-11 w-full rounded-2xl border border-border/70 bg-background/80 px-4 text-sm outline-none"
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      className="rounded-2xl"
                      onClick={() => handleRemoveDetail(detail.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[24px] border border-primary/15 bg-primary/5 p-4">
            <div className="flex items-center gap-2 text-primary">
              <Trophy className="size-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.14em]">
                Nota calculada automáticamente
              </span>
            </div>

            <p className="mt-3 text-2xl font-bold text-primary">
              {calculatedGrade.toFixed(2)}
            </p>
          </div>
        </section>
      )}

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
        <Button onClick={handleSubmit} disabled={saving} className="rounded-2xl">
          <Save className="mr-2 size-4" />
          {saving
            ? 'Guardando...'
            : submitLabel ?? (mode === 'create'
            ? 'Crear calificación'
            : 'Guardar cambios')}
        </Button>
      </div>
    </div>
  )
}