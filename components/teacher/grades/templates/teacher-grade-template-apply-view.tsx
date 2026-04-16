'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  Loader2,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  applyTeacherGradeTemplate,
  getTeacherCourseStudentsSimple,
  getTeacherGradeTemplateById,
} from '@/lib/teacher/grade-templates/api'
import type {
  ApplyGradeTemplatePayload,
  CourseStudentSimpleItem,
  GradeTemplateDetail,
} from '@/lib/teacher/grade-templates/types'
import {
  getGradeTemplateSkillLabel,
  getTipoCalificacionLabel,
  supportsTemplateSkills,
} from '@/lib/teacher/grade-templates/utils'

type Props = {
  courseId: number
  templateId: number
  courseName: string
  courseYear: number
}

type StudentApplyFormItem = {
  alumnoId: number
  nombre: string
  apellido: string
  dni: number
  email: string
  selected: boolean
  detalles: Array<{
    skill: number
    puntajeObtenido: string
    puntajeMaximo: number
  }>
}

function HeroMetaCard({
  icon: Icon,
  label,
  value,
  tone = 'default',
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  tone?: 'default' | 'highlight'
}) {
  const containerClass =
    tone === 'highlight'
      ? 'rounded-[24px] border border-primary/15 bg-primary/5 px-5 py-5 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)]'
      : 'rounded-[24px] border border-border/60 bg-background/75 px-5 py-5 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)]'

  const iconWrapClass =
    tone === 'highlight'
      ? 'bg-primary/10 text-primary'
      : 'bg-background text-muted-foreground'

  const labelClass = tone === 'highlight' ? 'text-primary/80' : 'text-muted-foreground'
  const valueClass = tone === 'highlight' ? 'text-primary' : 'text-foreground'

  return (
    <div className={containerClass}>
      <div className="flex items-center gap-3">
        <div
          className={`flex size-10 items-center justify-center rounded-2xl ${iconWrapClass}`}
        >
          <Icon className="size-4.5" />
        </div>

        <span
          className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${labelClass}`}
        >
          {label}
        </span>
      </div>

      <p className={`mt-4 text-base font-semibold tracking-tight ${valueClass}`}>{value}</p>
    </div>
  )
}

function getTipoVisual(tipo: number) {
  switch (tipo) {
    case 2:
      return {
        icon: ClipboardList,
        badgeClass:
          'border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-400',
      }
    case 3:
      return {
        icon: FileCheck2,
        badgeClass:
          'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-400',
      }
    case 4:
      return {
        icon: Users,
        badgeClass:
          'border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
      }
    case 5:
      return {
        icon: ShieldCheck,
        badgeClass:
          'border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-400',
      }
    default:
      return {
        icon: Sparkles,
        badgeClass: 'border-primary/15 bg-primary/5 text-primary',
      }
  }
}

function buildStudentItems(
  students: CourseStudentSimpleItem[],
  template: GradeTemplateDetail | null
): StudentApplyFormItem[] {
  const templateDetails = template?.detalles ?? []

  return students.map((student) => ({
    alumnoId: student.alumnoId,
    nombre: student.nombre,
    apellido: student.apellido,
    dni: student.dni,
    email: student.email,
    selected: false,
    detalles: templateDetails.map((detail) => ({
      skill: detail.skill,
      puntajeObtenido: '',
      puntajeMaximo: detail.puntajeMaximo,
    })),
  }))
}

export function TeacherGradeTemplateApplyView({
  courseId,
  templateId,
  courseName,
  courseYear,
}: Props) {
  const router = useRouter()

  const [template, setTemplate] = useState<GradeTemplateDetail | null>(null)
  const [students, setStudents] = useState<StudentApplyFormItem[]>([])
  const [fecha, setFecha] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [templateResponse, studentsResponse] = await Promise.all([
        getTeacherGradeTemplateById(courseId, templateId),
        getTeacherCourseStudentsSimple(courseId, 1, 100, ''),
      ])

      setTemplate(templateResponse)
      setStudents(buildStudentItems(studentsResponse.items ?? [], templateResponse))
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo cargar la plantilla y los alumnos.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [courseId, templateId])

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase()

    if (!term) return students

    return students.filter((student) => {
      const fullName = `${student.nombre} ${student.apellido}`.toLowerCase()
      return (
        fullName.includes(term) ||
        student.email.toLowerCase().includes(term) ||
        String(student.dni).includes(term)
      )
    })
  }, [students, search])

  const selectedCount = useMemo(
    () => students.filter((student) => student.selected).length,
    [students]
  )

  const templateUsesSkills = supportsTemplateSkills(template?.tipo ?? 0)

  const handleToggleStudent = (alumnoId: number) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.alumnoId === alumnoId
          ? { ...student, selected: !student.selected }
          : student
      )
    )
  }

  const handleToggleAllVisible = () => {
    const visibleIds = new Set(filteredStudents.map((student) => student.alumnoId))
    const allSelected = filteredStudents.every((student) => student.selected)

    setStudents((prev) =>
      prev.map((student) =>
        visibleIds.has(student.alumnoId)
          ? { ...student, selected: !allSelected }
          : student
      )
    )
  }

  const handleSkillScoreChange = (
    alumnoId: number,
    skill: number,
    value: string
  ) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.alumnoId !== alumnoId
          ? student
          : {
              ...student,
              detalles: student.detalles.map((detail) =>
                detail.skill === skill
                  ? { ...detail, puntajeObtenido: value }
                  : detail
              ),
            }
      )
    )
  }

  const validatePayload = () => {
    if (!fecha) {
      throw new Error('La fecha es obligatoria.')
    }

    const selectedStudents = students.filter((student) => student.selected)

    if (!selectedStudents.length) {
      throw new Error('Seleccioná al menos un alumno.')
    }

    if (templateUsesSkills) {
      for (const student of selectedStudents) {
        for (const detail of student.detalles) {
          if (detail.puntajeObtenido === '') {
            throw new Error(
              `Completá todos los puntajes del alumno ${student.nombre} ${student.apellido}.`
            )
          }

          const obtained = Number(detail.puntajeObtenido)

          if (Number.isNaN(obtained) || obtained < 0) {
            throw new Error(
              `El puntaje obtenido de ${student.nombre} ${student.apellido} no es válido.`
            )
          }

          if (obtained > detail.puntajeMaximo) {
            throw new Error(
              `El puntaje de ${getGradeTemplateSkillLabel(detail.skill)} no puede superar ${detail.puntajeMaximo} para ${student.nombre} ${student.apellido}.`
            )
          }
        }
      }
    }
  }

  const buildPayload = (): ApplyGradeTemplatePayload => {
    const selectedStudents = students.filter((student) => student.selected)

    return {
      fecha,
      alumnos: selectedStudents.map((student) => ({
        alumnoId: student.alumnoId,
        detalles: templateUsesSkills
          ? student.detalles.map((detail) => ({
              skill: detail.skill,
              puntajeObtenido: Number(detail.puntajeObtenido),
            }))
          : [],
      })),
    }
  }

  const handleSubmit = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      validatePayload()

      const payload = buildPayload()
      await applyTeacherGradeTemplate(courseId, templateId, payload)

      setSuccess('La plantilla se aplicó correctamente a los alumnos seleccionados.')

      setTimeout(() => {
        router.push(`/teacher/courses/${courseId}/grade-templates`)
      }, 900)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo aplicar la plantilla.')
    } finally {
      setSaving(false)
    }
  }

  const tipoVisual = getTipoVisual(template?.tipo ?? 0)
  const TipoIcon = tipoVisual.icon

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Aplicar plantilla de calificación" />

      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <section className="relative overflow-hidden rounded-[30px] border border-border/60 bg-card/95 p-6 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.18)] md:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(36,59,123,0.08),transparent_34%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.06),transparent_28%)]" />

          <div className="relative space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="outline"
                className="rounded-2xl border-border/70 bg-background/70 transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                onClick={() => router.push(`/teacher/courses/${courseId}/grade-templates`)}
              >
                <ArrowLeft className="mr-2 size-4" />
                Volver a plantillas
              </Button>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Aplicar plantilla
              </p>

              <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                {template?.titulo ?? 'Cargando plantilla...'}
              </h1>

              <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-[15px]">
                Seleccioná alumnos del curso y cargá los puntajes obtenidos para generar las calificaciones a partir de esta plantilla.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <HeroMetaCard
                icon={BookOpen}
                label="Curso"
                value={courseName}
                tone="highlight"
              />
              <HeroMetaCard
                icon={CalendarDays}
                label="Año"
                value={String(courseYear)}
              />
              <HeroMetaCard
                icon={TipoIcon}
                label="Tipo"
                value={template ? getTipoCalificacionLabel(template.tipo) : '--'}
              />
              <HeroMetaCard
                icon={Users}
                label="Seleccionados"
                value={String(selectedCount)}
              />
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-border/60 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)] md:p-7">
          {loading ? (
            <div className="rounded-[28px] border border-dashed border-border/70 bg-background/40 px-6 py-16 text-center text-sm text-muted-foreground">
              Cargando datos...
            </div>
          ) : !template ? (
            <div className="rounded-[28px] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              No se pudo cargar la plantilla.
            </div>
          ) : (
            <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_320px]">
        <div className="relative overflow-hidden rounded-[28px] border border-border/60 bg-background/70 p-5 shadow-[0_14px_32px_-20px_rgba(15,23,42,0.14)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(36,59,123,0.07),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.05),transparent_28%)]" />

          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${tipoVisual.badgeClass}`}
                  >
                    <TipoIcon className="size-3.5" />
                    {getTipoCalificacionLabel(template.tipo)}
                  </span>

                  {template.detalles?.length > 0 && (
                    <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      {template.detalles.length} skill{template.detalles.length === 1 ? '' : 's'}
                    </span>
                  )}
                </div>

                <h2 className="mt-3 text-xl font-semibold tracking-tight text-foreground">
                  {template.titulo}
                </h2>

                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                  {template.descripcion?.trim()
                    ? template.descripcion
                    : 'Sin descripción adicional.'}
                </p>
              </div>

              <div className="hidden md:block">
                <div className={`rounded-[22px] border px-4 py-4 shadow-sm ${tipoVisual.badgeClass}`}>
                  <div
                    className={`flex size-11 items-center justify-center rounded-2xl ${tipoVisual.badgeClass}`}
                  >
                    <TipoIcon className="size-5" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5">
              {template.detalles?.length > 0 ? (
                <div className="flex flex-wrap gap-2.5">
                  {template.detalles.map((detail) => (
                    <div
                      key={detail.id ?? detail.skill}
                      className="group inline-flex min-w-[170px] items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/85 px-3.5 py-2.5 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.16)] transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/20 hover:bg-primary/[0.04]"
                    >
                      <div className="min-w-0">
                        <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Skill
                        </span>
                        <span className="block truncate text-sm font-semibold text-foreground">
                          {getGradeTemplateSkillLabel(detail.skill)}
                        </span>
                      </div>

                      <div className="inline-flex shrink-0 items-center rounded-xl border border-primary/15 bg-primary/8 px-2.5 py-1.5">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary/75">
                          Máx.
                        </span>
                        <span className="ml-2 text-sm font-bold text-primary">
                          {detail.puntajeMaximo}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="inline-flex items-center rounded-2xl border border-border/60 bg-background/75 px-3.5 py-2 text-xs font-medium text-muted-foreground">
                  Sin skills configuradas
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-border/60 bg-background/70 p-5 shadow-[0_14px_32px_-20px_rgba(15,23,42,0.14)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Configuración
          </p>

          <div className="mt-4 space-y-4">
            <div className="rounded-[22px] border border-border/60 bg-card/80 p-4 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.12)]">
              <label className="text-sm font-medium text-foreground">Fecha</label>

              <div className="relative mt-3">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="h-11 w-full rounded-2xl border border-border/70 bg-background/85 pl-10 pr-4 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] outline-none transition-all duration-200 focus:ring-4 focus:ring-primary/15"
                />
              </div>
            </div>

            <div className="rounded-[22px] border border-primary/15 bg-primary/5 px-4 py-4 shadow-[0_12px_24px_-18px_rgba(36,59,123,0.18)]">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <CheckCircle2 className="size-4.5" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary">
                    Aplicación masiva
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Se crearán calificaciones únicamente para los alumnos seleccionados.
                  </p>
                </div>
              </div>
            </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Alumnos
                  </p>
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                    Selección y carga
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Marcá los alumnos a evaluar y completá los puntajes obtenidos.
                  </p>
                </div>

                <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row">
                  <div className="relative w-full lg:w-[320px]">
                    <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar alumno..."
                      className="h-11 rounded-2xl border-border/70 bg-background/85 pl-11 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)]"
                    />
                  </div>

                  <Button
                    variant="outline"
                    className="rounded-2xl border-border/70 bg-background/70 transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                    onClick={handleToggleAllVisible}
                  >
                    <Plus className="mr-2 size-4" />
                    {filteredStudents.length > 0 &&
                    filteredStudents.every((student) => student.selected)
                      ? 'Deseleccionar todos'
                      : 'Seleccionar todos'}
                  </Button>
                </div>
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

              {filteredStudents.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-border/70 bg-background/40 px-6 py-16 text-center text-sm text-muted-foreground">
                  No hay alumnos para mostrar con el filtro actual.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredStudents.map((student) => (
                    <article
  key={student.alumnoId}
  className={`group relative overflow-hidden rounded-[28px] border p-5 shadow-[0_14px_32px_-20px_rgba(15,23,42,0.16)] transition-all duration-200 ${
    student.selected
      ? 'border-primary/20 bg-primary/[0.05] shadow-[0_20px_38px_-24px_rgba(36,59,123,0.22)]'
      : 'border-border/60 bg-card/95 hover:-translate-y-[1px] hover:shadow-[0_20px_38px_-24px_rgba(15,23,42,0.18)]'
  }`}
>
  {student.selected && (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-primary/[0.10] via-primary/[0.04] to-transparent" />
  )}

  <div className="relative">
    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <label className="inline-flex cursor-pointer items-start gap-3">
              <div className="pt-0.5">
                <input
                  type="checkbox"
                  checked={student.selected}
                  onChange={() => handleToggleStudent(student.alumnoId)}
                  className="size-4 rounded border-border text-primary focus:ring-primary"
                />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-semibold tracking-tight text-foreground">
                    {student.nombre} {student.apellido}
                  </span>

                  {student.selected && (
                    <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                      Seleccionado
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  Alumno disponible para aplicar la plantilla.
                </p>
              </div>
            </label>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
              DNI {student.dni}
            </span>

            <span className="inline-flex max-w-full items-center rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
              <span className="truncate">{student.email}</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    {templateUsesSkills && student.selected && (
      <div className="mt-5 rounded-[24px] border border-border/60 bg-background/55 p-4 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.14)]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Evaluación por skills
            </p>
            <p className="mt-1 text-sm text-foreground">
              Cargá el puntaje obtenido para cada skill del alumno.
            </p>
          </div>

          <div className="inline-flex items-center rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-xs font-semibold text-primary">
            {student.detalles.length} skill{student.detalles.length === 1 ? '' : 's'}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {student.detalles.map((detail) => (
            <div
              key={`${student.alumnoId}-${detail.skill}`}
              className="group/detail rounded-[24px] border border-border/60 bg-card/90 p-4 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.14)] transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/15 hover:shadow-[0_18px_30px_-22px_rgba(15,23,42,0.18)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Skill
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {getGradeTemplateSkillLabel(detail.skill)}
                  </p>
                </div>

                <div className="inline-flex shrink-0 items-center rounded-xl border border-primary/15 bg-primary/8 px-2.5 py-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary/75">
                    Máx.
                  </span>
                  <span className="ml-2 text-sm font-bold text-primary">
                    {detail.puntajeMaximo}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Puntaje obtenido
                </label>

                <div className="relative">
                  <Trophy className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="number"
                    min="0"
                    max={detail.puntajeMaximo}
                    step="0.01"
                    value={detail.puntajeObtenido}
                    onChange={(e) =>
                      handleSkillScoreChange(
                        student.alumnoId,
                        detail.skill,
                        e.target.value
                      )
                    }
                    className="h-11 w-full rounded-2xl border border-border/70 bg-background/90 pl-10 pr-4 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] outline-none transition-all duration-200 focus:ring-4 focus:ring-primary/15"
                    placeholder={`0 - ${detail.puntajeMaximo}`}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Rango permitido</span>
                  <span>0 a {detail.puntajeMaximo}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
</article>
                  ))}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={handleSubmit}
                  disabled={saving || loading}
                  className="rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg active:translate-y-0 active:shadow-md"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Aplicando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 size-4" />
                      Aplicar plantilla
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}