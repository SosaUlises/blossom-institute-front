'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowUpRight, BookOpen, Inbox } from 'lucide-react'

import { CourseForm } from '@/components/admin/courses/course-form'
import { AppHeader } from '@/components/layout/app-header'
import { AdminBreadcrumbs } from '@/components/layout/breadcrumbs'
import { WorkspaceHeader } from '@/components/shared/workspace-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getCourseById, updateCourse } from '@/lib/admin/courses/api'
import type { CreateCursoDTO, CursoById, UpdateCursoDTO } from '@/lib/admin/courses/types'

export default function EditCoursePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

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

  const handleSubmit = async (payload: CreateCursoDTO | UpdateCursoDTO) => {
    await updateCourse(courseId, payload as UpdateCursoDTO)
    router.push('/admin/dashboard/courses')
    router.refresh()
  }

  return (
    <>
      <AppHeader title="Ajustes académicos" />

      <div className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-5xl space-y-5">
          <AdminBreadcrumbs
            items={[
              { label: 'Cursos', href: '/admin/dashboard/courses' },
              {
                label: course?.nombre ?? 'Curso',
                href: `/admin/dashboard/courses/${courseId}/profile`,
              },
              { label: 'Editar' },
            ]}
          />
          <WorkspaceHeader
            title="Ajustes académicos"
            description="Mantené la base del curso alineada con el seguimiento institucional."
            metadata={
              <div className="flex items-center gap-2">
                <BookOpen className="size-4 text-primary" />
                <span className="font-medium text-foreground">Curso en seguimiento</span>
              </div>
            }
            action={
              <Button asChild variant="outline" className="h-10 rounded-xl shadow-none">
                <Link href={`/admin/dashboard/courses/${courseId}/profile`}>
                  Ver seguimiento
                  <ArrowUpRight className="ml-2 size-4" />
                </Link>
              </Button>
            }
          />

          {loading ? (
            <div className="space-y-5">
              <section className="rounded-2xl border border-border/60 bg-card/95 p-5 shadow-sm">
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="h-24 animate-pulse rounded-2xl bg-muted/30" />
                  <div className="h-24 animate-pulse rounded-2xl bg-muted/30" />
                  <div className="h-24 animate-pulse rounded-2xl bg-muted/30" />
                </div>
              </section>

              <section className="rounded-2xl border border-border/60 bg-card/95 p-5 shadow-sm">
                <div className="space-y-5">
                  <div className="h-6 w-48 animate-pulse rounded-xl bg-muted/40" />
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="h-11 animate-pulse rounded-xl bg-muted/35" />
                    <div className="h-11 animate-pulse rounded-xl bg-muted/35" />
                  </div>
                  <div className="h-24 animate-pulse rounded-xl bg-muted/35" />
                </div>
              </section>

              <section className="rounded-2xl border border-border/60 bg-card/95 p-5 shadow-sm">
                <div className="space-y-5">
                  <div className="h-6 w-48 animate-pulse rounded-xl bg-muted/40" />
                  <div className="h-11 w-80 animate-pulse rounded-xl bg-muted/35" />
                  <div className="h-28 animate-pulse rounded-2xl bg-muted/35" />
                </div>
              </section>
            </div>
          ) : loadError ? (
            <Card className="rounded-2xl border border-border/60 bg-card/95 shadow-sm">
              <CardContent className="px-6 py-14">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
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
            <CourseForm mode="edit" initialData={course} onSubmit={handleSubmit} />
          ) : (
            <Card className="rounded-2xl border border-border/60 bg-card/95 shadow-sm">
              <CardContent className="px-6 py-14">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
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
