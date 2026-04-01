'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

import { AppHeader } from '@/components/layout/app-header'
import { CoursePeople } from '@/components/admin/courses/course-people'
import { getCourseById } from '@/lib/admin/courses/api'
import type { CursoById } from '@/lib/admin/courses/types'

export default function ManageCoursePage() {
  const params = useParams<{ id: string }>()
  const [course, setCourse] = useState<CursoById | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getCourseById(Number(params.id))
        setCourse(data)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [params.id])

  return (
    <>
      <AppHeader title="Manage course" />

      <div className="flex-1 overflow-auto px-6 py-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Gestionar curso
            </h2>
            <p className="text-sm text-muted-foreground">
              Administrá alumnos y profesores asignados al curso.
            </p>
          </section>

          {loading ? (
            <div className="rounded-2xl border border-border/70 bg-card/95 p-8 shadow-sm">
              <div className="space-y-4">
                <div className="h-10 animate-pulse rounded-xl bg-muted/50" />
                <div className="h-10 animate-pulse rounded-xl bg-muted/50" />
                <div className="h-10 animate-pulse rounded-xl bg-muted/50" />
              </div>
            </div>
          ) : course ? (
            <>
              <div className="rounded-2xl border border-border/70 bg-card/95 p-6 shadow-sm">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Curso
                  </p>
                  <h3 className="text-xl font-semibold tracking-tight text-foreground">
                    {course.nombre}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Año {course.anio} · {course.cantidadAlumnos} alumnos · {course.cantidadProfesores} profesores
                  </p>
                </div>
              </div>

              <CoursePeople cursoId={Number(params.id)} />
            </>
          ) : (
            <div className="rounded-2xl border border-border/70 bg-card/95 p-8 text-sm text-muted-foreground">
              No se pudo cargar el curso.
            </div>
          )}
        </div>
      </div>
    </>
  )
}