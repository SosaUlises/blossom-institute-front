'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

import { AppHeader } from '@/components/layout/app-header'
import { CourseForm } from '@/components/courses/course-form'
import { getCourseById, updateCourse } from '@/lib/courses/api'
import type { CreateCursoDTO, CursoById, UpdateCursoDTO } from '@/lib/courses/types'

export default function EditCoursePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

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

  const handleSubmit = async (payload: CreateCursoDTO | UpdateCursoDTO) => {
    await updateCourse(Number(params.id), payload as UpdateCursoDTO)
    router.push('/dashboard/courses')
    router.refresh()
  }

  return (
    <>
      <AppHeader title="Edit course" />

      <div className="flex-1 overflow-auto px-6 py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <section className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Editar curso
            </h2>
            <p className="text-sm text-muted-foreground">
              Actualizá la información y los horarios del curso.
            </p>
          </section>

          {loading ? (
            <div className="rounded-2xl border border-border/70 bg-card/95 p-8 shadow-sm">
              <div className="space-y-4">
                <div className="h-10 animate-pulse rounded-xl bg-muted/50" />
                <div className="h-10 animate-pulse rounded-xl bg-muted/50" />
                <div className="h-10 animate-pulse rounded-xl bg-muted/50" />
                <div className="h-10 animate-pulse rounded-xl bg-muted/50" />
              </div>
            </div>
          ) : course ? (
            <CourseForm mode="edit" initialData={course} onSubmit={handleSubmit} />
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