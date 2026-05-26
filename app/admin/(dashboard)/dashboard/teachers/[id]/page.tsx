'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PencilLine, Inbox } from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { WorkspaceHeader } from '@/components/shared/workspace-header'
import { TeacherForm } from '@/components/admin/teachers/teacher-form'
import { getTeacherById, updateTeacher } from '@/lib/admin/teachers/api'
import type {
  Profesor,
  CreateProfesorDTO,
  UpdateProfesorDTO,
} from '@/lib/admin/teachers/types'
import { Card, CardContent } from '@/components/ui/card'

export default function EditTeacherPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const teacherId = useMemo(() => Number(params.id), [params.id])

  const [teacher, setTeacher] = useState<Profesor | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setLoadError(null)

      try {
        const data = await getTeacherById(teacherId)
        setTeacher(data)
      } catch (err: any) {
        setLoadError(err?.message || 'No se pudo cargar el profesor.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [teacherId])

  const handleSubmit = async (payload: CreateProfesorDTO | UpdateProfesorDTO) => {
    await updateTeacher(teacherId, payload as UpdateProfesorDTO)
    router.push('/admin/dashboard/teachers')
    router.refresh()
  }

  return (
    <>
      <AppHeader title="Edit teacher" />

      <div className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-5xl space-y-5">
          <WorkspaceHeader
            title="Editar profesor"
            description="Actualiza los datos principales del profesor seleccionado."
            metadata={
              <div className="flex items-center gap-2">
                <PencilLine className="size-4 text-primary" />
                <span className="font-medium text-foreground">Edicion de profesor</span>
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
                <div className="space-y-5">
                  <div className="h-6 w-48 animate-pulse rounded-xl bg-muted/40" />
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="h-12 animate-pulse rounded-2xl bg-muted/35" />
                    <div className="h-12 animate-pulse rounded-2xl bg-muted/35" />
                  </div>
                  <div className="h-12 w-80 animate-pulse rounded-2xl bg-muted/35" />
                </div>
              </section>

              <section className="rounded-2xl border border-border/60 bg-card/95 p-6 shadow-sm">
                <div className="space-y-5">
                  <div className="h-6 w-48 animate-pulse rounded-xl bg-muted/40" />
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="h-12 animate-pulse rounded-2xl bg-muted/35" />
                    <div className="h-12 animate-pulse rounded-2xl bg-muted/35" />
                  </div>
                </div>
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
                    No se pudo cargar el profesor
                  </h4>

                  <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    {loadError}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : teacher ? (
            <TeacherForm mode="edit" initialData={teacher} onSubmit={handleSubmit} />
          ) : (
            <Card className="rounded-2xl border border-border/60 bg-card/95 shadow-sm">
              <CardContent className="px-6 py-14">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="flex size-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                    <Inbox className="size-6" />
                  </div>

                  <h4 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                    Profesor no disponible
                  </h4>

                  <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    No se pudo cargar la informaciÃ³n del profesor seleccionado.
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