'use client'

import { useMemo, useState } from 'react'
import {
  ClipboardList,
  FileCheck2,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Trophy,
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
          'Plantilla estructurada con detalle por skills y puntajes máximos.',
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
          'No se puede repetir la misma skill dentro de una misma plantilla.'
        )
      }

      const detallesValidos = detalles.filter(
        (item) => item.skill && item.puntajeMaximo !== ''
      )

      if (!detallesValidos.length) {
        throw new Error('Debés cargar al menos una skill.')
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
    <div className="space-y-6">
      <section className="rounded-2xl border border-border/60 bg-card/95 p-6 shadow-[0_1px_2px_rgba(15,23,42,0.035)]">
        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="group rounded-2xl border border-primary/15 bg-primary/5 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.035)] transition-all duration-200 hover:bg-primary/[0.07] hover:shadow-[0_1px_2px_rgba(15,23,42,0.035)]">
            <div className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-200">
                <TipoIcon className="size-4.5" />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/80">
                  Tipo seleccionado
                </p>
                <p className="mt-2 text-base font-semibold tracking-tight text-primary">
                  {tipoVisual.title}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {tipoVisual.description}
                </p>
              </div>
            </div>
          </div>

          <div className="group rounded-2xl border border-border/60 bg-background/75 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.035)] transition-all duration-200 hover:bg-background hover:shadow-[0_1px_2px_rgba(15,23,42,0.035)]">
            <div className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-background text-muted-foreground transition-transform duration-200">
                <ClipboardList className="size-4.5" />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Modo
                </p>
                <p className="mt-2 text-base font-semibold tracking-tight text-foreground">
                  {useSkills ? 'Plantilla con skills' : 'Seleccioná un tipo'}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {useSkills
                    ? 'Define las skills y sus puntajes máximos una sola vez.'
                    : 'El tipo define cómo se completa la plantilla.'}
                </p>
              </div>
            </div>
          </div>

          <div className="group rounded-2xl border border-border/60 bg-background/75 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.035)] transition-all duration-200 hover:bg-background hover:shadow-[0_1px_2px_rgba(15,23,42,0.035)]">
            <div className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-background text-muted-foreground transition-transform duration-200">
                <Trophy className="size-4.5" />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Reutilización
                </p>
                <p className="mt-2 text-base font-semibold tracking-tight text-foreground">
                  {useSkills
                    ? `${validSkillsCount} skill${validSkillsCount === 1 ? '' : 's'} definida${validSkillsCount === 1 ? '' : 's'}`
                    : 'Pendiente'}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  La plantilla se podrá aplicar después a múltiples alumnos del curso.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="flex h-11 w-full rounded-2xl border border-border/70 bg-background/85 px-4 text-sm shadow-[0_1px_2px_rgba(15,23,42,0.035)] outline-none transition-all duration-200 focus:ring-4 focus:ring-primary/15"
            >
              <option value="">Seleccionar tipo</option>
              {gradeTemplateTipoOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Título</label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="h-11 w-full rounded-2xl border border-border/70 bg-background/85 px-4 text-sm shadow-[0_1px_2px_rgba(15,23,42,0.035)] outline-none transition-all duration-200 focus:ring-4 focus:ring-primary/15"
              placeholder="Ej. Quiz Unit 5, Test Midterm..."
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-foreground">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-border/70 bg-background/85 px-4 py-3 text-sm shadow-[0_1px_2px_rgba(15,23,42,0.035)] outline-none transition-all duration-200 focus:ring-4 focus:ring-primary/15"
              placeholder="Detalle opcional para identificar cuándo conviene usar esta plantilla..."
            />
          </div>
        </div>
      </section>

      {useSkills && (
        <section
          className={`rounded-2xl border p-6 shadow-[0_1px_2px_rgba(15,23,42,0.035)] ${tipoVisual.accent}`}
        >
          <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Skills
              </p>
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                Estructura reutilizable
              </h3>
              <p className="text-sm text-muted-foreground">
                Definí las skills y el puntaje máximo esperado para cada una.
              </p>
            </div>

            <Button
              variant="outline"
              className="rounded-2xl border-border/70 bg-background/70 transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
              onClick={handleAddDetail}
            >
              <Plus className="mr-2 size-4" />
              Agregar skill
            </Button>
          </div>

          <div className="space-y-4">
            {detalles.map((detail, index) => (
              <div
                key={detail.id}
                className="rounded-2xl border border-border/60 bg-card/80 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.035)] transition-all duration-200 hover:bg-card hover:shadow-md"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${tipoVisual.iconTone}`}
                    >
                      <TipoIcon className="size-4.5" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Skill {index + 1}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Definí skill y puntaje máximo.
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="rounded-2xl border-border/70 bg-background/70 transition-all duration-200 hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
                    onClick={() => handleRemoveDetail(detail.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Skill</label>
                    <select
                      value={detail.skill}
                      onChange={(e) =>
                        handleChangeDetail(detail.id, 'skill', e.target.value)
                      }
                      className="flex h-11 w-full rounded-2xl border border-border/70 bg-background/85 px-4 text-sm shadow-[0_1px_2px_rgba(15,23,42,0.035)] outline-none transition-all duration-200 focus:ring-4 focus:ring-primary/15"
                    >
                      <option value="">Seleccionar skill</option>
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
                      className="h-11 w-full rounded-2xl border border-border/70 bg-background/85 px-4 text-sm shadow-[0_1px_2px_rgba(15,23,42,0.035)] outline-none transition-all duration-200 focus:ring-4 focus:ring-primary/15"
                      placeholder="Ej. 100"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[0.95fr_1.25fr]">
            <div className="group rounded-2xl border border-border/60 bg-card/80 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.035)] transition-all duration-200 hover:bg-card hover:shadow-[0_1px_2px_rgba(15,23,42,0.035)]">
              <div className="flex items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-background text-muted-foreground shadow-sm">
                  <ClipboardList className="size-4.5" />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Skills válidas
                  </p>

                  <div className="mt-2 flex items-end gap-2">
                    <p className="text-3xl font-semibold tracking-tight text-foreground">
                      {validSkillsCount}
                    </p>
                    <span className="pb-1 text-xs font-medium text-muted-foreground">
                      completas
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Cantidad de skills listas para reutilizar al aplicar la plantilla.
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`group rounded-2xl border p-5 transition-all duration-200 ${calculatedTone.card}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p
                    className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${calculatedTone.label}`}
                  >
                    Resultado teórico
                  </p>

                  <div className="mt-3 flex items-end gap-3">
                    <p
                      className={`text-2xl font-semibold leading-none tracking-tight ${calculatedTone.value}`}
                    >
                      {calculatedGrade.toFixed(2)}
                    </p>
                    <span
                      className={`pb-1 text-xs font-medium ${calculatedTone.suffix}`}
                    >
                      / 100
                    </span>
                  </div>

                  <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                    Vista previa si todas las skills se completaran con su puntaje máximo.
                  </p>
                </div>

                <div
                  className={`flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-transform duration-200 ${calculatedTone.icon}`}
                >
                  <Trophy className="size-5" />
                </div>
              </div>

              <div
                className={`mt-5 h-2 overflow-hidden rounded-full ${calculatedTone.barBg}`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-300 ${calculatedTone.barFill}`}
                  style={{
                    width: `${Math.max(0, Math.min(100, calculatedGrade))}%`,
                  }}
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

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={saving}
          className="rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:bg-primary/90 hover:shadow-lg active:translate-y-0 active:shadow-md"
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
