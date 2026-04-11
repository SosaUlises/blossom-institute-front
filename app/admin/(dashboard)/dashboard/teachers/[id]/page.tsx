'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PencilLine, Inbox } from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
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

      <div className="flex-1 overflow-auto px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-8">
          <section className="relative overflow-hidden rounded-[28px] border border-border/60 bg-card/90 px-6 py-7 shadow-[0_24px_80px_-34px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:px-7 sm:py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(36,59,123,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(198,61,79,0.05),transparent_24%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(72,99,180,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(198,61,79,0.08),transparent_26%)]" />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-5 h-[3px] w-12 rounded-full bg-primary" />

                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/80">
                  Teachers management
                </p>

                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-[2.45rem]">
                  Editar profesor
                </h2>

                <p className="mt-4 max-w-2xl text-[15px] leading-7 text-muted-foreground">
                  Actualizá la información principal del profesor seleccionado dentro del instituto.
                </p>
              </div>

              <div className="group inline-flex items-center gap-3 rounded-2xl border border-border/60 bg-background/80 px-4 py-4 shadow-[0_14px_30px_-22px_rgba(15,23,42,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_22px_40px_-22px_rgba(15,23,42,0.22)]">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-200 group-hover:scale-[1.05] group-hover:bg-primary/15">
                  <PencilLine className="size-5" />
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Acción
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    Edición de profesor
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
                <div className="space-y-5">
                  <div className="h-6 w-48 animate-pulse rounded-xl bg-muted/40" />
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="h-12 animate-pulse rounded-2xl bg-muted/35" />
                    <div className="h-12 animate-pulse rounded-2xl bg-muted/35" />
                  </div>
                  <div className="h-12 w-80 animate-pulse rounded-2xl bg-muted/35" />
                </div>
              </section>

              <section className="rounded-[28px] border border-border/60 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
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
            <Card className="rounded-[28px] border border-border/60 bg-card/95 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
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
            <Card className="rounded-[28px] border border-border/60 bg-card/95 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
              <CardContent className="px-6 py-14">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="flex size-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                    <Inbox className="size-6" />
                  </div>

                  <h4 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                    Profesor no disponible
                  </h4>

                  <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    No se pudo cargar la información del profesor seleccionado.
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