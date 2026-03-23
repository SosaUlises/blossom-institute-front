'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

import { AppHeader } from '@/components/layout/app-header'
import { TeacherForm } from '@/components/teachers/teacher-form'
import { getTeacherById, updateTeacher } from '@/lib/teachers/api'
import type { Profesor, CreateProfesorDTO, UpdateProfesorDTO } from '@/lib/teachers/types'

export default function EditTeacherPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const [teacher, setTeacher] = useState<Profesor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getTeacherById(Number(params.id))
        setTeacher(data)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [params.id])

  const handleSubmit = async (payload: CreateProfesorDTO | UpdateProfesorDTO) => {
    await updateTeacher(Number(params.id), payload as UpdateProfesorDTO)
    router.push('/dashboard/teachers')
    router.refresh()
  }

  return (
    <>
      <AppHeader title="Edit teacher" />

      <div className="flex-1 overflow-auto px-6 py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <section className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Editar profesor
            </h2>
            <p className="text-sm text-muted-foreground">
              Actualizá la información del profesor seleccionado.
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
          ) : teacher ? (
            <TeacherForm mode="edit" initialData={teacher} onSubmit={handleSubmit} />
          ) : (
            <div className="rounded-2xl border border-border/70 bg-card/95 p-8 text-sm text-muted-foreground">
              No se pudo cargar el profesor.
            </div>
          )}
        </div>
      </div>
    </>
  )
}