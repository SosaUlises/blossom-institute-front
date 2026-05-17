'use client'

import { useMemo, useState } from 'react'
import {
  CalendarDays,
  Percent,
  Plus,
  Save,
  Trash2,
  Trophy,
  ClipboardList,
  FileCheck2,
  Users,
  ShieldCheck,
  Sparkles,
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

const qualitativeNoteOptions = [
  { label: 'E', value: '100' },
  { label: 'VG', value: '90' },
  { label: 'G', value: '80' },
  { label: 'R', value: '65' },
]

const fieldClassName =
  'h-10 w-full rounded-xl border border-border/60 bg-background/75 px-3 text-sm outline-none transition-colors focus:border-primary/35 focus:ring-2 focus:ring-primary/15'

function isQualitativeNoteValue(value: string) {
  return qualitativeNoteOptions.some((option) => option.value === value)
}

function createEmptyDetail() {
  return {
    id: crypto.randomUUID(),
    skill: '',
    puntajeObtenido: '',
    puntajeMaximo: '',
  }
}

function getTipoVisual(tipo: number) {
  switch (tipo) {
    case 2:
      return {
        icon: ClipboardList,
        title: 'Quiz',
        description: 'Actividad breve para medir comprensión puntual.',
        badgeClass:
          'border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-400',
        accent: 'border-violet-500/20 bg-violet-500/[0.06]',
        iconTone: 'bg-violet-500/10 text-violet-700 dark:text-violet-400',
      }
    case 3:
      return {
        icon: FileCheck2,
        title: 'Test',
        description: 'Evaluación estructurada con resultado final directo.',
        badgeClass:
          'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-400',
        accent: 'border-sky-500/20 bg-sky-500/[0.06]',
        iconTone: 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
      }
    case 4:
      return {
        icon: Users,
        title: 'Participación',
        description: 'Registro del involucramiento e intervención del alumno.',
        badgeClass:
          'border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
        accent: 'border-cyan-500/20 bg-cyan-500/[0.06]',
        iconTone: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
      }
    case 5:
      return {
        icon: ShieldCheck,
        title: 'Comportamiento',
        description: 'Observación vinculada a actitud, conducta y convivencia.',
        badgeClass:
          'border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-400',
        accent: 'border-orange-500/20 bg-orange-500/[0.06]',
        iconTone: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
      }
    default:
      return {
        icon: Sparkles,
        title: 'Seleccionar tipo',
        description: 'Elegí el tipo de calificación para configurar el formulario.',
        badgeClass: 'border-primary/15 bg-primary/5 text-primary',
        accent: 'border-border/60 bg-background/75',
        iconTone: 'bg-primary/10 text-primary',
      }
  }
}

function getCalculatedGradeTone(nota: number) {
  if (nota >= 80) {
    return {
      card: 'border-emerald-500/20 bg-emerald-500/[0.08] shadow-[0_1px_2px_rgba(15,23,42,0.035)] hover:bg-emerald-500/[0.10] hover:shadow-[0_1px_2px_rgba(15,23,42,0.035)]',
      label: 'text-emerald-700/80 dark:text-emerald-400/90',
      value: 'text-emerald-700 dark:text-emerald-400',
      suffix: 'text-emerald-700/70 dark:text-emerald-400/70',
      icon: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
      barBg: 'bg-emerald-500/10',
      barFill: 'bg-emerald-500',
    }
  }

  if (nota >= 60) {
    return {
      card: 'border-amber-500/20 bg-amber-500/[0.08] shadow-[0_1px_2px_rgba(15,23,42,0.035)] hover:bg-amber-500/[0.10] hover:shadow-[0_1px_2px_rgba(15,23,42,0.035)]',
      label: 'text-amber-700/80 dark:text-amber-400/90',
      value: 'text-amber-700 dark:text-amber-400',
      suffix: 'text-amber-700/70 dark:text-amber-400/70',
      icon: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
      barBg: 'bg-amber-500/10',
      barFill: 'bg-amber-500',
    }
  }

  return {
    card: 'border-rose-500/20 bg-rose-500/[0.08] shadow-[0_1px_2px_rgba(15,23,42,0.035)] hover:bg-rose-500/[0.10] hover:shadow-[0_1px_2px_rgba(15,23,42,0.035)]',
    label: 'text-rose-700/80 dark:text-rose-400/90',
    value: 'text-rose-700 dark:text-rose-400',
    suffix: 'text-rose-700/70 dark:text-rose-400/70',
    icon: 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
    barBg: 'bg-rose-500/10',
    barFill: 'bg-rose-500',
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
    initialValues?.detalles?.length ? initialValues.detalles : [createEmptyDetail()],
  )

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const tipoNumber = Number(tipo || 0)
  const useSkills = supportsSkills(tipoNumber)
  const useDirectNote = requiresDirectNote(tipoNumber)
  const tipoVisual = getTipoVisual(tipoNumber)
  const TipoIcon = tipoVisual.icon

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

  const calculatedTone = getCalculatedGradeTone(calculatedGrade)

  const validSkillsCount = useMemo(() => {
    return detalles.filter(
      (item) =>
        item.skill &&
        item.puntajeObtenido !== '' &&
        item.puntajeMaximo !== '',
    ).length
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
    value: string,
  ) => {
    setDetalles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
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
          'No se puede repetir la misma skill dentro de una misma calificación.',
        )
      }

      if (useSkills && calculatedGrade > 100) {
        throw new Error('La nota calculada no puede superar 100.')
      }

      if (useDirectNote && nota.trim() && Number(nota) > 100) {
        throw new Error('La nota no puede superar 100.')
      }

      const payload: GradeFormPayload = {
        tipo: Number(tipo),
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || null,
        fecha,
        tareaId: null,
        entregaId: null,
        nota: useSkills ? null : nota.trim() ? Number(nota) : null,
        detalles: useSkills
          ? detalles
              .filter(
                (item) =>
                  item.skill &&
                  item.puntajeObtenido !== '' &&
                  item.puntajeMaximo !== '',
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
          : 'Calificación actualizada correctamente.',
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4 pb-24 lg:pb-4">
      <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] sm:p-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${tipoVisual.badgeClass}`}>
            <TipoIcon className="size-3.5" />
            {tipoVisual.title}
          </span>
          <span className="inline-flex items-center rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground dark:bg-background/35">
            {useSkills ? 'Calculada por habilidades' : useDirectNote ? 'Nota directa' : 'Elegí un tipo'}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className={fieldClassName}
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
                className={`${fieldClassName} pl-10`}
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-foreground">Título</label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className={fieldClassName}
              placeholder="Ej. Quiz Unit 3, Participación marzo..."
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-foreground">Comentario</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-border/60 bg-background/75 px-3 py-3 text-sm outline-none transition-colors focus:border-primary/35 focus:ring-2 focus:ring-primary/15"
              placeholder="Detalle opcional de la evaluación..."
            />
          </div>
        </div>
      </section>

      {useDirectNote && (
        <section className={`rounded-2xl border p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] sm:p-5 ${tipoVisual.accent}`}>
          <div className="mb-4">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Nota directa
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nota</label>
              <div className="relative">
                <Percent className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  className={`${fieldClassName} pl-10`}
                >
                  <option value="">Seleccionar nota</option>
                  {nota.trim() && !isQualitativeNoteValue(nota) && (
                    <option value={nota} disabled>
                      Valor no compatible ({Number(nota).toFixed(2)})
                    </option>
                  )}
                  {qualitativeNoteOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-xs text-muted-foreground">Máximo permitido: 100.</p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-xl border border-primary/15 bg-primary/5 px-3 py-2 text-primary">
              <Trophy className="size-4" />
              <span className="text-sm font-medium">Nota final</span>
              <span className="text-base font-semibold">
                {nota.trim() ? Number(nota).toFixed(2) : '--'}
              </span>
            </div>
          </div>
        </section>
      )}

      {useSkills && (
        <section className={`rounded-2xl border p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] sm:p-5 ${tipoVisual.accent}`}>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                Detalle por habilidades
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Cada habilidad solo puede usarse una vez.
              </p>
            </div>

            <Button
              variant="outline"
              className="h-9 rounded-lg border-border/70 bg-background/70 px-3 transition-colors duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
              onClick={handleAddDetail}
            >
              <Plus className="mr-2 size-4" />
              Agregar habilidad
            </Button>
          </div>

          <div className="space-y-3">
            {detalles.map((detail, index) => (
              <div
                key={detail.id}
                className="rounded-xl border border-border/60 bg-background/55 p-3 transition-colors duration-200 hover:border-primary/20 hover:bg-background/75 dark:bg-background/25"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">
                    Habilidad {index + 1}
                  </p>

                  <Button
                    variant="outline"
                    className="size-9 rounded-lg border-border/70 bg-background/70 p-0 transition-colors duration-200 hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
                    onClick={() => handleRemoveDetail(detail.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_140px_140px]">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Habilidad</label>
                    <select
                      value={detail.skill}
                      onChange={(e) =>
                        handleChangeDetail(detail.id, 'skill', e.target.value)
                      }
                      className={fieldClassName}
                    >
                      <option value="">Seleccionar habilidad</option>
                      {skillOptions
                        .filter(
                          (option) =>
                            option.value === detail.skill ||
                            !getSelectedSkills(detail.id).includes(option.value),
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
                      className={fieldClassName}
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
                      className={fieldClassName}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
            <div className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background/55 px-3 py-2 text-sm text-muted-foreground dark:bg-background/25">
              <ClipboardList className="size-4" />
              {validSkillsCount} completas
            </div>

            <div className={`rounded-xl border p-3 transition-colors duration-200 ${calculatedTone.card}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className={`text-sm font-medium ${calculatedTone.label}`}>
                  Nota calculada
                </span>
                <span className={`text-base font-semibold ${calculatedTone.value}`}>
                  {calculatedGrade.toFixed(2)} / 100
                </span>
              </div>
              <div className={`mt-2 h-2 overflow-hidden rounded-full ${calculatedTone.barBg}`}>
                <div
                  className={`h-full rounded-full transition-all duration-300 ${calculatedTone.barFill}`}
                  style={{ width: `${Math.max(0, Math.min(100, calculatedGrade))}%` }}
                />
              </div>
            </div>
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

      <div className="sticky bottom-0 z-10 -mx-5 flex justify-end border-t border-border/60 bg-background/95 px-5 py-3 backdrop-blur lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0">
        <Button
          onClick={handleSubmit}
          disabled={saving}
          className="h-10 rounded-xl bg-primary px-4 text-primary-foreground shadow-none transition-colors duration-200 hover:bg-primary/90"
        >
          <Save className="mr-2 size-4" />
          {saving
            ? 'Guardando...'
            : submitLabel ?? (mode === 'create'
              ? 'Guardar calificación'
              : 'Actualizar calificación')}
        </Button>
      </div>
    </div>
  )
}
