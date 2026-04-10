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
  FileText,
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
      card: 'border-emerald-500/20 bg-emerald-500/[0.08] shadow-[0_18px_34px_-22px_rgba(16,185,129,0.24)] hover:bg-emerald-500/[0.10] hover:shadow-[0_24px_42px_-22px_rgba(16,185,129,0.30)]',
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
      card: 'border-amber-500/20 bg-amber-500/[0.08] shadow-[0_18px_34px_-22px_rgba(245,158,11,0.22)] hover:bg-amber-500/[0.10] hover:shadow-[0_24px_42px_-22px_rgba(245,158,11,0.28)]',
      label: 'text-amber-700/80 dark:text-amber-400/90',
      value: 'text-amber-700 dark:text-amber-400',
      suffix: 'text-amber-700/70 dark:text-amber-400/70',
      icon: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
      barBg: 'bg-amber-500/10',
      barFill: 'bg-amber-500',
    }
  }

  return {
    card: 'border-rose-500/20 bg-rose-500/[0.08] shadow-[0_18px_34px_-22px_rgba(244,63,94,0.22)] hover:bg-rose-500/[0.10] hover:shadow-[0_24px_42px_-22px_rgba(244,63,94,0.28)]',
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
    <div className="space-y-6">
      <section className="rounded-[28px] border border-border/60 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="group rounded-[24px] border border-primary/15 bg-primary/5 p-5 shadow-[0_12px_28px_-20px_rgba(36,59,123,0.24)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-primary/[0.07] hover:shadow-[0_18px_34px_-22px_rgba(36,59,123,0.30)]">
            <div className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-[1.02]">
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

          <div className="group rounded-[24px] border border-border/60 bg-background/75 p-5 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.12)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-background hover:shadow-[0_18px_30px_-22px_rgba(15,23,42,0.16)]">
            <div className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-background text-muted-foreground transition-transform duration-200 group-hover:scale-[1.02]">
                <CalendarDays className="size-4.5" />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Fecha
                </p>
                <p className="mt-2 text-base font-semibold tracking-tight text-foreground">
                  {fecha || 'Sin fecha seleccionada'}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  La fecha es obligatoria para registrar la calificación.
                </p>
              </div>
            </div>
          </div>

          <div className="group rounded-[24px] border border-border/60 bg-background/75 p-5 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.12)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-background hover:shadow-[0_18px_30px_-22px_rgba(15,23,42,0.16)]">
            <div className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-background text-muted-foreground transition-transform duration-200 group-hover:scale-[1.02]">
                {useSkills ? (
                  <Trophy className="size-4.5" />
                ) : (
                  <Percent className="size-4.5" />
                )}
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Modo de carga
                </p>
                <p className="mt-2 text-base font-semibold tracking-tight text-foreground">
                  {useSkills
                    ? 'Calculada por skills'
                    : useDirectNote
                      ? 'Nota directa'
                      : 'Seleccioná un tipo'}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {useSkills
                    ? 'La nota final se calcula automáticamente.'
                    : useDirectNote
                      ? 'La nota se ingresa manualmente.'
                      : 'El tipo define cómo se registra la calificación.'}
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
              className="flex h-11 w-full rounded-2xl border border-border/70 bg-background/85 px-4 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] outline-none transition-all duration-200 focus:ring-4 focus:ring-primary/15"
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
                className="h-11 w-full rounded-2xl border border-border/70 bg-background/85 pl-10 pr-4 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] outline-none transition-all duration-200 focus:ring-4 focus:ring-primary/15"
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-foreground">Título</label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="h-11 w-full rounded-2xl border border-border/70 bg-background/85 px-4 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] outline-none transition-all duration-200 focus:ring-4 focus:ring-primary/15"
              placeholder="Ej. Quiz Unit 3, Participation March, Test Midterm..."
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-foreground">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-border/70 bg-background/85 px-4 py-3 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] outline-none transition-all duration-200 focus:ring-4 focus:ring-primary/15"
              placeholder="Detalle opcional de la evaluación..."
            />
          </div>
        </div>
      </section>

      {useDirectNote && (
        <section className={`rounded-[28px] border p-6 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)] ${tipoVisual.accent}`}>
          <div className="mb-5 space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Nota directa
            </p>
            <h3 className="text-lg font-semibold tracking-tight text-foreground">
              Calificación manual
            </h3>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nota</label>
              <div className="relative">
                <Percent className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="number"
                  step="0.01"
                  max="100"
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  className="h-11 w-full rounded-2xl border border-border/70 bg-background/85 pl-10 pr-4 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] outline-none transition-all duration-200 focus:ring-4 focus:ring-primary/15"
                  placeholder="0 - 100"
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Ingresá el valor final de la calificación. El máximo permitido es 100.
              </p>
            </div>

            <div className="rounded-[24px] border border-primary/15 bg-primary/5 px-5 py-5 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/80">
                Vista previa
              </p>

              <div className="mt-2 flex items-end justify-between gap-3">
                <div>
                  <p className="text-3xl font-semibold tracking-tight text-primary">
                    {nota.trim() ? Number(nota).toFixed(2) : '--'}
                  </p>
                  <p className="mt-1 text-xs text-primary/70">
                    Resultado manual cargado
                  </p>
                </div>

                <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Trophy className="size-4.5" />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {useSkills && (
        <section className={`rounded-[28px] border p-6 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)] ${tipoVisual.accent}`}>
          <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Skills
              </p>
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                Detalle por skills
              </h3>
              <p className="text-sm text-muted-foreground">
                Cada skill solo puede usarse una vez dentro de la misma calificación.
              </p>
            </div>

            <Button
              variant="outline"
              className="rounded-2xl border-border/70 bg-background/70 transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
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
                className="rounded-[24px] border border-border/60 bg-card/80 p-5 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-card hover:shadow-md"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${tipoVisual.iconTone}`}>
                      <TipoIcon className="size-4.5" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Skill {index + 1}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Definí skill, puntaje obtenido y puntaje máximo.
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="rounded-2xl border-border/70 bg-background/70 transition-all duration-200 hover:-translate-y-[1px] hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
                    onClick={() => handleRemoveDetail(detail.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px_180px]">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Skill</label>
                    <select
                      value={detail.skill}
                      onChange={(e) =>
                        handleChangeDetail(detail.id, 'skill', e.target.value)
                      }
                      className="flex h-11 w-full rounded-2xl border border-border/70 bg-background/85 px-4 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] outline-none transition-all duration-200 focus:ring-4 focus:ring-primary/15"
                    >
                      <option value="">Seleccionar skill</option>
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
                      className="h-11 w-full rounded-2xl border border-border/70 bg-background/85 px-4 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] outline-none transition-all duration-200 focus:ring-4 focus:ring-primary/15"
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
                      className="h-11 w-full rounded-2xl border border-border/70 bg-background/85 px-4 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] outline-none transition-all duration-200 focus:ring-4 focus:ring-primary/15"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[0.95fr_1.25fr]">
            <div className="group rounded-[24px] border border-border/60 bg-card/80 p-5 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.14)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-card hover:shadow-[0_18px_30px_-22px_rgba(15,23,42,0.18)]">
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
                    Cantidad de skills listas para entrar en el cálculo final.
                  </p>
                </div>
              </div>
            </div>

            <div className={`group rounded-[26px] border p-5 transition-all duration-200 hover:-translate-y-[1px] ${calculatedTone.card}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${calculatedTone.label}`}>
                    Nota calculada
                  </p>

                  <div className="mt-3 flex items-end gap-3">
                    <p className={`text-[2.25rem] font-semibold leading-none tracking-tight ${calculatedTone.value}`}>
                      {calculatedGrade.toFixed(2)}
                    </p>
                    <span className={`pb-1 text-xs font-medium ${calculatedTone.suffix}`}>
                      / 100
                    </span>
                  </div>

                  <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                    Resultado automático según los puntajes cargados en cada skill.
                  </p>
                </div>

                <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-transform duration-200 group-hover:scale-[1.03] ${calculatedTone.icon}`}>
                  <Trophy className="size-5" />
                </div>
              </div>

              <div className={`mt-5 h-2 overflow-hidden rounded-full ${calculatedTone.barBg}`}>
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

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={saving}
          className="rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg active:translate-y-0 active:shadow-md"
        >
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