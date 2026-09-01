'use client'

import { type FormEvent, useMemo, useState } from 'react'
import {
  CalendarDays,
  Percent,
  Plus,
  Save,
  Trash2,
  Trophy,
  CheckCircle2,
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
import { cn } from '@/lib/utils'

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
      card: 'border-emerald-500/20 bg-emerald-500/[0.06]',
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
      card: 'border-amber-500/20 bg-amber-500/[0.06]',
      label: 'text-amber-700/80 dark:text-amber-400/90',
      value: 'text-amber-700 dark:text-amber-400',
      suffix: 'text-amber-700/70 dark:text-amber-400/70',
      icon: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
      barBg: 'bg-amber-500/10',
      barFill: 'bg-amber-500',
    }
  }

  return {
    card: 'border-rose-500/20 bg-rose-500/[0.06]',
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

  const validSkillsCount = useMemo(() => {
    return detalles.filter(
      (item) =>
        item.skill &&
        item.puntajeObtenido !== '' &&
        item.puntajeMaximo !== '',
    ).length
  }, [detalles])

  const calculatedTone =
    validSkillsCount > 0 ? getCalculatedGradeTone(calculatedGrade) : null
  const directGrade = nota.trim() && Number.isFinite(Number(nota)) ? Number(nota) : null
  const directTone = directGrade == null ? null : getCalculatedGradeTone(directGrade)

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

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    if (saving) return

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      if (!tipo) throw new Error('El tipo es obligatorio.')
      if (!titulo.trim()) throw new Error('El título es obligatorio.')
      if (!fecha) throw new Error('La fecha es obligatoria.')

      if (useSkills && hasDuplicateSkills()) {
        throw new Error(
          'No se puede repetir la misma habilidad dentro de una misma calificación.',
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
    <form
      className="space-y-4 pb-24 lg:pb-4"
      aria-busy={saving}
      onSubmit={handleSubmit}
    >
      <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.025)] dark:bg-card/90 sm:p-5">
        <div className="mb-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Qué evaluaste
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Elegí el tipo, nombrá la evaluación y registrá la fecha.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <fieldset className="space-y-2 md:col-span-2">
            <legend className="text-sm font-medium text-foreground">
              Tipo de calificación
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {tipoCalificacionOptions.map((option) => {
                const optionValue = Number(option.value)
                const optionVisual = getTipoVisual(optionValue)
                const OptionIcon = optionVisual.icon
                const selected = tipo === option.value
                const helper = supportsSkills(optionValue)
                  ? 'Detalle por habilidades'
                  : 'Nota directa'

                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setTipo(option.value)}
                    className={cn(
                      'relative flex min-h-[88px] items-start gap-3 rounded-xl border border-border/60 bg-background/55 p-3 pr-9 text-left transition-colors hover:border-primary/25 hover:bg-background/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 dark:bg-background/25',
                      selected &&
                        'border-primary/35 bg-primary/[0.055] dark:bg-primary/[0.08]',
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-xl',
                        optionVisual.iconTone,
                      )}
                    >
                      <OptionIcon className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-foreground">
                        {optionVisual.title}
                      </span>
                      <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                        {optionVisual.description}
                      </span>
                      <span className="mt-1 block text-xs font-medium text-muted-foreground">
                        {helper}
                      </span>
                    </span>
                    {selected ? (
                      <CheckCircle2 className="absolute right-3 top-3 size-4 text-primary" />
                    ) : null}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Título</label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className={fieldClassName}
              placeholder="Ej. Quiz Unit 3"
            />
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
            <label className="text-sm font-medium text-foreground">Comentario</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              className="min-h-24 w-full resize-y rounded-xl border border-border/60 bg-background/75 px-3 py-3 text-sm outline-none transition-colors focus:border-primary/35 focus:ring-2 focus:ring-primary/15"
              placeholder="Comentario opcional para contextualizar la evaluación..."
            />
          </div>
        </div>
      </section>

      {useDirectNote && (
        <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.025)] dark:bg-card/90 sm:p-5">
          <div className="mb-3">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Nota directa
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Cargá la nota final tal como quedó registrada.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-end">
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

              <p className="text-xs text-muted-foreground">
                La nota máxima permitida es 100.
              </p>
            </div>

            <div
              className={cn(
                'rounded-xl border border-border/60 bg-background/55 px-3 py-2.5 text-foreground dark:bg-background/25',
                directTone?.card,
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Trophy className="size-4" />
                  Nota final
                </span>
                <span
                  className={cn(
                    'text-xl font-semibold tracking-tight text-foreground',
                    directTone?.value,
                  )}
                >
                  {directGrade == null ? '--' : directGrade.toFixed(2)}
                </span>
              </div>
              <span className="mt-1 block text-xs text-muted-foreground">
                Resultado registrado
              </span>
            </div>
          </div>
        </section>
      )}

      {useSkills && (
        <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.025)] dark:bg-card/90 sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                Habilidades evaluadas
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Cargá los puntajes por área y Blossom calcula la nota final.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-9 w-full rounded-lg border-border/70 bg-background/70 px-3 transition-colors duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary sm:w-auto"
              onClick={handleAddDetail}
              disabled={saving}
            >
              <Plus className="mr-2 size-4" />
              Agregar habilidad
            </Button>
          </div>

          <div className="space-y-3">
            {detalles.map((detail, index) => {
              const selectedSkillLabel =
                skillOptions.find((option) => option.value === detail.skill)?.label ??
                `Habilidad ${index + 1}`

              return (
              <div
                key={detail.id}
                className="rounded-xl border border-border/55 bg-background/45 p-3 transition-colors duration-200 hover:border-primary/20 hover:bg-background/70 dark:bg-background/25"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">
                      {selectedSkillLabel}
                    </p>

                  <Button
                    type="button"
                    variant="outline"
                    aria-label={`Quitar habilidad ${index + 1}`}
                    className="size-9 rounded-lg border-border/70 bg-background/70 p-0 transition-colors duration-200 hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
                    onClick={() => handleRemoveDetail(detail.id)}
                    disabled={saving}
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
                      Obtenido
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
                      Máximo
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
              )
            })}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-center">
            <div className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background/55 px-3 py-2 text-sm text-muted-foreground dark:bg-background/25">
              <ClipboardList className="size-4" />
              {validSkillsCount} {validSkillsCount === 1 ? 'habilidad completa' : 'habilidades completas'}
            </div>

            <div
              className={cn(
                'rounded-xl border border-border/60 bg-background/55 p-3 transition-colors duration-200 dark:bg-background/25',
                calculatedTone?.card,
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                  className={cn(
                    'text-sm font-medium text-muted-foreground',
                    calculatedTone?.label,
                  )}
                >
                  Nota calculada
                </span>
                <span
                  className={cn(
                    'text-xl font-semibold tracking-tight text-foreground',
                    calculatedTone?.value,
                  )}
                >
                  {validSkillsCount > 0 ? `${calculatedGrade.toFixed(2)} / 100` : '--'}
                </span>
              </div>
              <div
                className={cn(
                  'mt-2 h-2 overflow-hidden rounded-full bg-muted',
                  calculatedTone?.barBg,
                )}
              >
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-300',
                    calculatedTone?.barFill,
                  )}
                  style={{
                    width:
                      validSkillsCount > 0
                        ? `${Math.max(0, Math.min(100, calculatedGrade))}%`
                        : '0%',
                  }}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] px-4 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-300"
        >
          {success}
        </div>
      )}

      <div className="sticky bottom-0 z-10 -mx-4 flex justify-end border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur sm:-mx-5 sm:px-5 lg:static lg:mx-0 lg:rounded-2xl lg:border lg:border-border/60 lg:bg-card/80 lg:px-4 lg:py-3">
        <Button
          type="submit"
          disabled={saving}
          aria-busy={saving}
          className="h-10 w-full rounded-xl bg-primary px-4 text-primary-foreground shadow-none transition-colors duration-200 hover:bg-primary/90 sm:w-auto"
        >
          <Save className="mr-2 size-4" />
          {saving
            ? 'Guardando...'
            : submitLabel ?? (mode === 'create'
              ? 'Guardar calificación'
              : 'Actualizar calificación')}
        </Button>
      </div>
    </form>
  )
}
