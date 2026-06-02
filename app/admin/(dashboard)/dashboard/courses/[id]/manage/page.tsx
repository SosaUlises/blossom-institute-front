'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { Settings2, BookOpen, Users, GraduationCap, Inbox } from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { WorkspaceHeader } from '@/components/shared/workspace-header'
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
    <div className="rounded-xl border border-border/60 bg-background/75 p-4 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)]">
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

      <div className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-7xl space-y-5">
          <WorkspaceHeader
            title="Ver curso"
            description="Administra alumnos y profesores asignados al curso."
            metadata={
              <div className="flex items-center gap-2">
                <Settings2 className="size-4 text-primary" />
                <span className="font-medium text-foreground">Gestion del curso</span>
              </div>
            }
          />
          {loading ? (
            <div className="space-y-6">
              <section className="rounded-2xl border border-border/60 bg-card/95 p-6 shadow-sm">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="h-24 animate-pulse rounded-xl bg-muted/30" />
                  <div className="h-24 animate-pulse rounded-xl bg-muted/30" />
                  <div className="h-24 animate-pulse rounded-xl bg-muted/30" />
                </div>
              </section>

              <section className="rounded-2xl border border-border/60 bg-card/95 p-6 shadow-sm">
                <div className="h-72 animate-pulse rounded-xl bg-muted/30" />
              </section>
            </div>
          ) : loadError ? (
            <Card className="rounded-2xl border border-border/60 bg-card/95 shadow-sm">
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
              <section className="rounded-2xl border border-border/60 bg-card/95 p-6 shadow-sm">
                <div className="space-y-5">
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Curso seleccionado
                    </p>
                    <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                      {course.nombre}
                    </h3>
                    <p className="text-sm leading-6 text-muted-foreground">
                      AdministrÃ¡ la composiciÃ³n del curso y sus asignaciones activas.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <MetaInfoCard icon={BookOpen} label="AÃ±o" value={String(course.anio)} />
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
            <Card className="rounded-2xl border border-border/60 bg-card/95 shadow-sm">
              <CardContent className="px-6 py-14">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="flex size-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                    <Inbox className="size-6" />
                  </div>

                  <h4 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                    Curso no disponible
                  </h4>

                  <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    No se pudo cargar la informaciÃ³n del curso seleccionado.
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
