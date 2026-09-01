'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CalendarDays,
  CheckCircle2,
  Loader2,
  Search,
  Trophy,
} from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  PersonAvatar,
  PersonMeta,
} from '@/components/teacher/course-detail/course-people-ui'
import {
  TemplateSkillRows,
  TemplateTypeBadge,
} from './grade-template-ui'
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
  email: string
  avatarUrl?: string | null
  selected: boolean
  detalles: Array<{
    skill: number
    puntajeObtenido: string
    puntajeMaximo: number
  }>
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
    email: student.email,
    avatarUrl: student.avatarUrl,
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
        student.email.toLowerCase().includes(term)
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

  return (
    <>
      <AppHeader title="Aplicar plantilla" />

      <main className="flex-1 overflow-auto px-4 py-5 pb-24 sm:px-5 sm:py-6 lg:px-8 lg:py-8 lg:pb-8">
        <div className="mx-auto max-w-6xl space-y-4">
        <header className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {courseName}
          </p>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Aplicar plantilla
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              {template?.titulo
                ? `Cargá calificaciones usando “${template.titulo}”.`
                : 'Cargando plantilla...'}
            </p>
          </div>
        </header>

        {loading ? (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className="h-72 animate-pulse rounded-xl border border-border/60 bg-muted/20" />
            <div className="h-64 animate-pulse rounded-xl border border-border/60 bg-muted/20" />
          </div>
        ) : !template ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            No se pudo cargar la plantilla.
          </div>
        ) : (
          <>
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
              <section className="min-w-0 rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.025)] dark:border-border/70">
                <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">
                      Alumnos
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Elegí alumnos y cargá sus puntajes.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="relative w-full sm:w-64">
                      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <label htmlFor="student-template-search" className="sr-only">
                        Buscar alumno
                      </label>
                      <Input
                        id="student-template-search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar alumno..."
                        className="h-10 rounded-xl border-border/60 bg-background/75 pl-10 shadow-none focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35"
                      />
                    </div>

                    <Button
                      variant="outline"
                      className="h-10 rounded-xl border-border/70 bg-background/70 px-3 shadow-none transition-colors hover:border-primary/25 hover:bg-primary/5 hover:text-primary"
                      onClick={handleToggleAllVisible}
                      disabled={filteredStudents.length === 0}
                    >
                      {filteredStudents.length > 0 &&
                      filteredStudents.every((student) => student.selected)
                        ? 'Deseleccionar visibles'
                        : 'Seleccionar visibles'}
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mb-4 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-600 dark:text-green-400">
                    {success}
                  </div>
                )}

                {filteredStudents.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/70 bg-muted/15 px-4 py-6 text-center text-sm text-muted-foreground dark:bg-muted/10">
                    {students.length === 0
                      ? 'Todavía no hay alumnos asignados a este curso.'
                      : 'No hay alumnos para mostrar con el filtro actual.'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredStudents.map((student) => {
                      const fullName = `${student.nombre} ${student.apellido}`.trim()

                      return (
                        <article
                          key={student.alumnoId}
                          className={`rounded-xl border px-3 py-3 transition-colors sm:px-4 ${
                            student.selected
                              ? 'border-primary/25 bg-primary/[0.045]'
                              : 'border-border/60 bg-background/60 hover:border-primary/20 hover:bg-card dark:bg-background/35'
                          }`}
                        >
                          <div className="flex flex-col gap-3">
                            <label className="flex cursor-pointer items-start gap-3">
                              <input
                                type="checkbox"
                                checked={student.selected}
                                onChange={() => handleToggleStudent(student.alumnoId)}
                                className="mt-3 size-4 rounded border-border text-primary focus:ring-primary"
                              />

                              <PersonAvatar
                                name={fullName}
                                avatarUrl={student.avatarUrl}
                                tone="student"
                              />

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="truncate text-sm font-semibold tracking-tight text-foreground sm:text-[15px]">
                                    {fullName}
                                  </p>
                                  {student.selected ? (
                                    <span className="inline-flex rounded-full border border-primary/15 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                      Seleccionado
                                    </span>
                                  ) : null}
                                </div>
                                <PersonMeta email={student.email} />
                              </div>
                            </label>

                            {templateUsesSkills && student.selected ? (
                              <div className="grid gap-2 border-t border-border/50 pt-3 md:grid-cols-2">
                                {student.detalles.map((detail) => (
                                  <div
                                    key={`${student.alumnoId}-${detail.skill}`}
                                    className="rounded-xl border border-border/60 bg-background/70 p-3"
                                  >
                                    <div className="mb-2 flex items-center justify-between gap-2">
                                      <span className="truncate text-sm font-medium text-foreground">
                                        {getGradeTemplateSkillLabel(detail.skill)}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        Máx. {detail.puntajeMaximo}
                                      </span>
                                    </div>

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
                                        className="h-10 w-full rounded-xl border border-border/60 bg-background/75 pl-10 pr-3 text-sm outline-none transition-colors focus:border-primary/35 focus:ring-2 focus:ring-primary/15 dark:bg-background/35"
                                        placeholder={`0 - ${detail.puntajeMaximo}`}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </article>
                      )
                    })}
                  </div>
                )}
              </section>

              <aside className="xl:sticky xl:top-6 xl:self-start">
                <div className="space-y-3 rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.025)] dark:border-border/70">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <TemplateTypeBadge tipo={template.tipo} />
                      <span className="inline-flex rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        {template.detalles.length
                          ? `${template.detalles.length} habilidades`
                          : 'Nota directa'}
                      </span>
                    </div>

                    <h2 className="mt-3 text-base font-semibold tracking-tight text-foreground">
                      {template.titulo}
                    </h2>
                    {template.descripcion?.trim() && (
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {template.descripcion}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Fecha</label>
                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        className="h-10 w-full rounded-xl border border-border/60 bg-background/75 pl-10 pr-3 text-sm outline-none transition-colors focus:border-primary/35 focus:ring-2 focus:ring-primary/15 dark:bg-background/35"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-background/60 px-3 py-3 dark:bg-background/35">
                    <p className="text-sm font-medium text-foreground">
                      {selectedCount} {selectedCount === 1 ? 'alumno seleccionado' : 'alumnos seleccionados'}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Solo se cargarán notas para quienes estén seleccionados.
                    </p>
                  </div>

                  {template.detalles.length > 0 && (
                    <TemplateSkillRows detalles={template.detalles} />
                  )}

                  <Button
                    onClick={handleSubmit}
                    disabled={saving || loading}
                    className="h-10 w-full rounded-xl bg-primary px-4 text-primary-foreground shadow-none transition-colors duration-200 hover:bg-primary/90"
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
              </aside>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur dark:bg-background/90 xl:hidden">
              <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  {selectedCount} {selectedCount === 1 ? 'seleccionado' : 'seleccionados'}
                </p>
                <Button
                  onClick={handleSubmit}
                  disabled={saving || loading}
                  className="h-10 rounded-xl bg-primary px-4 text-primary-foreground shadow-none transition-colors duration-200 hover:bg-primary/90"
                >
                  {saving ? 'Aplicando...' : 'Aplicar plantilla'}
                </Button>
              </div>
            </div>
          </>
        )}
        </div>
      </main>
    </>
  )
}
