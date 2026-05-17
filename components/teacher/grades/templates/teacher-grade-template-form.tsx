'use client'

import { useMemo, useState } from 'react'
import {
  ClipboardList,
  FileCheck2,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import type {
  GradeTemplateDetailFormValue,
  GradeTemplateFormPayload,
  GradeTemplateFormValues,
} from '@/lib/teacher/grade-templates/types'
import {
  calculateTemplateGradeFromSkills,
  gradeTemplateSkillOptions,
  gradeTemplateTipoOptions,
  supportsTemplateSkills,
} from '@/lib/teacher/grade-templates/utils'

type Props = {
  mode: 'create' | 'edit'
  initialValues?: Partial<GradeTemplateFormValues>
  onSubmit: (payload: GradeTemplateFormPayload) => Promise<void>
  submitLabel?: string
}

const fieldClassName =
  'h-10 w-full rounded-xl border border-border/60 bg-background/75 px-3 text-sm outline-none transition-colors focus:border-primary/35 focus:ring-2 focus:ring-primary/15 dark:bg-background/35'

function createEmptyDetail(): GradeTemplateDetailFormValue {
  return {
    id: crypto.randomUUID(),
    skill: '',
    puntajeMaximo: '',
  }
}

function getTipoVisual(tipo: number) {
  switch (tipo) {
    case 2:
      return {
        icon: ClipboardList,
        title: 'Quiz',
        description: 'Plantilla breve para evaluaciones puntuales y repetibles.',
        accent: 'border-violet-500/20 bg-violet-500/[0.06]',
        iconTone: 'bg-violet-500/10 text-violet-700 dark:text-violet-400',
      }
    case 3:
      return {
        icon: FileCheck2,
        title: 'Test',
        description:
          'Plantilla estructurada con detalle por habilidades y puntajes máximos.',
        accent: 'border-sky-500/20 bg-sky-500/[0.06]',
        iconTone: 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
      }
    default:
      return {
        icon: Sparkles,
        title: 'Seleccionar tipo',
        description: 'Elegí el tipo para configurar la plantilla.',
        accent: 'border-border/60 bg-background/75',
        iconTone: 'bg-primary/10 text-primary',
      }
  }
}

function getCalculatedTone(nota: number) {
  if (nota >= 80) {
    return {
      card: 'border-emerald-500/20 bg-emerald-500/[0.08] shadow-[0_1px_2px_rgba(15,23,42,0.035)]',
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
      card: 'border-amber-500/20 bg-amber-500/[0.08] shadow-[0_1px_2px_rgba(15,23,42,0.035)]',
      label: 'text-amber-700/80 dark:text-amber-400/90',
      value: 'text-amber-700 dark:text-amber-400',
      suffix: 'text-amber-700/70 dark:text-amber-400/70',
      icon: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
      barBg: 'bg-amber-500/10',
      barFill: 'bg-amber-500',
    }
  }

  return {
    card: 'border-rose-500/20 bg-rose-500/[0.08] shadow-[0_1px_2px_rgba(15,23,42,0.035)]',
    label: 'text-rose-700/80 dark:text-rose-400/90',
    value: 'text-rose-700 dark:text-rose-400',
    suffix: 'text-rose-700/70 dark:text-rose-400/70',
    icon: 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
    barBg: 'bg-rose-500/10',
    barFill: 'bg-rose-500',
  }
}

export function TeacherGradeTemplateForm({
  mode,
  initialValues,
  onSubmit,
  submitLabel,
}: Props) {
  const [tipo, setTipo] = useState(initialValues?.tipo ?? '')
  const [titulo, setTitulo] = useState(initialValues?.titulo ?? '')
  const [descripcion, setDescripcion] = useState(initialValues?.descripcion ?? '')
  const [detalles, setDetalles] = useState<GradeTemplateDetailFormValue[]>(
    initialValues?.detalles?.length
      ? initialValues.detalles
      : [createEmptyDetail()]
  )

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const tipoNumber = Number(tipo || 0)
  const useSkills = supportsTemplateSkills(tipoNumber)
  const tipoVisual = getTipoVisual(tipoNumber)
  const TipoIcon = tipoVisual.icon

  const calculatedGrade = useMemo(() => {
    const parsed = detalles
      .filter((item) => item.skill && item.puntajeMaximo !== '')
      .map((item) => ({
        puntajeObtenido: Number(item.puntajeMaximo),
        puntajeMaximo: Number(item.puntajeMaximo),
      }))

    if (!parsed.length) return 0

    return calculateTemplateGradeFromSkills(parsed)
  }, [detalles])

  const calculatedTone = getCalculatedTone(calculatedGrade)

  const validSkillsCount = useMemo(() => {
    return detalles.filter(
      (item) => item.skill && item.puntajeMaximo !== ''
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
    setDetalles((prev) => {
      const updated = prev.filter((item) => item.id !== id)
      return updated.length ? updated : [createEmptyDetail()]
    })
  }

  const handleChangeDetail = (
    id: string,
    field: 'skill' | 'puntajeMaximo',
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

      if (!useSkills) {
        throw new Error('El tipo seleccionado no es válido para una plantilla.')
      }

      if (hasDuplicateSkills()) {
        throw new Error(
          'No se puede repetir la misma habilidad dentro de una misma plantilla.'
        )
      }

      const detallesValidos = detalles.filter(
        (item) => item.skill && item.puntajeMaximo !== ''
      )

      if (!detallesValidos.length) {
        throw new Error('Debés cargar al menos una habilidad.')
      }

      if (detallesValidos.some((item) => Number(item.puntajeMaximo) <= 0)) {
        throw new Error('El puntaje máximo debe ser mayor a cero.')
      }

      const payload: GradeTemplateFormPayload = {
        tipo: Number(tipo),
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || null,
        detalles: detallesValidos.map((item) => ({
          skill: Number(item.skill),
          puntajeMaximo: Number(item.puntajeMaximo),
        })),
      }

      await onSubmit(payload)

      setSuccess(
        mode === 'create'
          ? 'Plantilla creada correctamente.'
          : 'Plantilla actualizada correctamente.'
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4 pb-24 lg:pb-4">
      <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] dark:border-border/70 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary">
            <TipoIcon className="size-3.5" />
            {tipoVisual.title}
          </span>
          <span className="inline-flex items-center rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground dark:bg-background/35">
            {useSkills ? `${validSkillsCount} habilidades` : 'Elegí un tipo'}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Título</label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className={fieldClassName}
              placeholder="Ej. Quiz Unit 5, Test Midterm..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className={fieldClassName}
            >
              <option value="">Seleccionar tipo</option>
              {gradeTemplateTipoOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-foreground">
              Descripción opcional
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-border/60 bg-background/75 px-3 py-3 text-sm outline-none transition-colors focus:border-primary/35 focus:ring-2 focus:ring-primary/15 dark:bg-background/35"
              placeholder="Detalle breve para reconocer cuándo conviene usar esta plantilla..."
            />
          </div>
        </div>
      </section>

      {useSkills && (
        <section className={`rounded-2xl border p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] sm:p-5 ${tipoVisual.accent}`}>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                Habilidades
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Definí la estructura reutilizable y el puntaje máximo de cada habilidad.
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
                    aria-label={`Quitar habilidad ${index + 1}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_160px]">
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
                      {gradeTemplateSkillOptions
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
                      placeholder="Ej. 100"
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
                  Puntaje teórico
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

      <div className="sticky bottom-0 z-10 -mx-4 flex justify-end border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur dark:bg-background/90 sm:-mx-5 sm:px-5 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0">
        <Button
          onClick={handleSubmit}
          disabled={saving}
          className="h-10 rounded-xl bg-primary px-4 text-primary-foreground shadow-none transition-colors duration-200 hover:bg-primary/90"
        >
          <Save className="mr-2 size-4" />
          {saving
            ? 'Guardando...'
            : submitLabel ?? (mode === 'create'
              ? 'Crear plantilla'
              : 'Guardar cambios')}
        </Button>
      </div>
    </div>
  )
}
