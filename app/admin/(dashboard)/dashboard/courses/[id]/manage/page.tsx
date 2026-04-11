'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { Settings2, BookOpen, Users, GraduationCap, Inbox } from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { CoursePeople } from '@/components/admin/courses/course-people'
import { getCourseById } from '@/lib/admin/courses/api'
import type { CursoById } from '@/lib/admin/courses/types'
import { Card, CardContent } from '@/components/ui/card'

function MetaInfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="rounded-[24px] border border-border/60 bg-background/75 p-4 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)]">
      <div className="flex items-start gap-3">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-4.5" />
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default function ManageCoursePage() {
  const params = useParams<{ id: string }>()
  const courseId = useMemo(() => Number(params.id), [params.id])

  const [course, setCourse] = useState<CursoById | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setLoadError(null)

      try {
        const data = await getCourseById(courseId)
        setCourse(data)
      } catch (err: any) {
        setLoadError(err?.message || 'No se pudo cargar el curso.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [courseId])

  return (
    <>
      <AppHeader title="Manage course" />

      <div className="flex-1 overflow-auto px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <section className="relative overflow-hidden rounded-[28px] border border-border/60 bg-card/90 px-6 py-7 shadow-[0_24px_80px_-34px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:px-7 sm:py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(36,59,123,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(198,61,79,0.05),transparent_24%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(72,99,180,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(198,61,79,0.08),transparent_26%)]" />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-5 h-[3px] w-12 rounded-full bg-primary" />

                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/80">
                  Courses management
                </p>

                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-[2.45rem]">
                  Gestionar curso
                </h2>

                <p className="mt-4 max-w-2xl text-[15px] leading-7 text-muted-foreground">
                  Administrá alumnos y profesores asignados al curso desde una vista centralizada.
                </p>
              </div>

              <div className="group inline-flex items-center gap-3 rounded-2xl border border-border/60 bg-background/80 px-4 py-4 shadow-[0_14px_30px_-22px_rgba(15,23,42,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_22px_40px_-22px_rgba(15,23,42,0.22)]">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-200 group-hover:scale-[1.05] group-hover:bg-primary/15">
                  <Settings2 className="size-5" />
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Acción
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    Gestión del curso
                  </p>
                </div>
              </div>
            </div>
          </section>

          {loading ? (
            <div className="space-y-6">
              <section className="rounded-[28px] border border-border/60 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="h-24 animate-pulse rounded-[24px] bg-muted/30" />
                  <div className="h-24 animate-pulse rounded-[24px] bg-muted/30" />
                  <div className="h-24 animate-pulse rounded-[24px] bg-muted/30" />
                </div>
              </section>

              <section className="rounded-[28px] border border-border/60 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
                <div className="h-72 animate-pulse rounded-[24px] bg-muted/30" />
              </section>
            </div>
          ) : loadError ? (
            <Card className="rounded-[28px] border border-border/60 bg-card/95 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
              <CardContent className="px-6 py-14">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="flex size-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                    <Inbox className="size-6" />
                  </div>

                  <h4 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                    No se pudo cargar el curso
                  </h4>

                  <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    {loadError}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : course ? (
            <>
              <section className="rounded-[28px] border border-border/60 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
                <div className="space-y-5">
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Curso seleccionado
                    </p>
                    <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                      {course.nombre}
                    </h3>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Administrá la composición del curso y sus asignaciones activas.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <MetaInfoCard icon={BookOpen} label="Año" value={String(course.anio)} />
                    <MetaInfoCard
                      icon={Users}
                      label="Alumnos"
                      value={`${course.cantidadAlumnos} asignados`}
                    />
                    <MetaInfoCard
                      icon={GraduationCap}
                      label="Profesores"
                      value={`${course.cantidadProfesores} asignados`}
                    />
                  </div>
                </div>
              </section>

              <CoursePeople cursoId={courseId} />
            </>
          ) : (
            <Card className="rounded-[28px] border border-border/60 bg-card/95 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
              <CardContent className="px-6 py-14">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="flex size-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                    <Inbox className="size-6" />
                  </div>

                  <h4 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                    Curso no disponible
                  </h4>

                  <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    No se pudo cargar la información del curso seleccionado.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}