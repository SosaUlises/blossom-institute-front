'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Plus,
  Search,
  Layers3,
  CalendarDays,
  BookOpen,
  Archive,
  Pencil,
  ClipboardList,
  FileCheck2,
  Users,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AppHeader } from '@/components/layout/app-header'
import {
  archiveTeacherGradeTemplate,
  getTeacherGradeTemplates,
} from '@/lib/teacher/grade-templates/api'
import type { GradeTemplateListItem } from '@/lib/teacher/grade-templates/types'
import {
  getGradeTemplateSkillLabel,
  getTipoCalificacionLabel,
} from '@/lib/teacher/grade-templates/utils'

type Props = {
  courseId: number
  courseName: string
  courseYear: number
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

export function TeacherGradeTemplateView({
  courseId,
  courseName,
  courseYear,
}: Props) {
  const router = useRouter()

  const [templates, setTemplates] = useState<GradeTemplateListItem[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [archivingId, setArchivingId] = useState<number | null>(null)

  const loadTemplates = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await getTeacherGradeTemplates(courseId, 1, 100, search)
      setTemplates(response.items ?? [])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudieron obtener las plantillas.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadTemplates()
    }, 250)

    return () => clearTimeout(timeout)
  }, [search])

  const visibleTemplates = useMemo(() => templates, [templates])

  const handleArchive = async (templateId: number) => {
    try {
      setArchivingId(templateId)
      setError(null)

      await archiveTeacherGradeTemplate(courseId, templateId)
      await loadTemplates()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo archivar la plantilla.'
      )
    } finally {
      setArchivingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Plantillas de calificación" />

      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <section className="relative overflow-hidden rounded-[30px] border border-border/60 bg-card/95 p-6 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.18)] md:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(36,59,123,0.08),transparent_34%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.06),transparent_28%)]" />

          <div className="relative space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="outline"
                className="rounded-2xl border-border/70 bg-background/70 transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                onClick={() => router.push(`/teacher/courses/${courseId}`)}
              >
                <ArrowLeft className="mr-2 size-4" />
                Volver al curso
              </Button>

              <Button
                className="rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg"
                onClick={() =>
                  router.push(`/teacher/courses/${courseId}/grade-templates/create`)
                }
              >
                <Plus className="mr-2 size-4" />
                Nueva plantilla
              </Button>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Gestionar calificaciones
              </p>

              <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                Plantillas de calificación
              </h1>

              <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-[15px]">
                Definí estructuras reutilizables para cargar evaluaciones del curso de forma más rápida y consistente.
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
                icon={Layers3}
                label="Plantillas"
                value={String(templates.length)}
              />
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-border/60 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)] md:p-7">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Listado
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Plantillas registradas
              </h2>
              <p className="text-sm text-muted-foreground">
                Buscá por título, tipo o skills configuradas.
              </p>
            </div>

            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar plantilla..."
                className="h-11 rounded-2xl border-border/70 bg-background/85 pl-11 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)]"
              />
            </div>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-[28px] border border-dashed border-border/70 bg-background/40 px-6 py-16 text-center text-sm text-muted-foreground">
              Cargando plantillas...
            </div>
          ) : visibleTemplates.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-border/70 bg-background/40 px-6 py-16">
              <div className="mx-auto flex max-w-md flex-col items-center text-center">
                <div className="flex size-14 items-center justify-center rounded-[22px] bg-primary/8 text-primary">
                  <ClipboardList className="size-6" />
                </div>

                <h3 className="mt-5 text-xl font-semibold tracking-tight text-foreground">
                  No hay plantillas para mostrar
                </h3>

                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Todavía no se registraron plantillas en este curso o la búsqueda no devolvió resultados.
                </p>

                <Button
                  className="mt-6 rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg"
                  onClick={() =>
                    router.push(`/teacher/courses/${courseId}/grade-templates/create`)
                  }
                >
                  <Plus className="mr-2 size-4" />
                  Crear plantilla
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {visibleTemplates.map((template) => {
                const tipoVisual = getTipoVisual(template.tipo)
                const TipoIcon = tipoVisual.icon

                return (
                  <article
                    key={template.id}
                    className="rounded-[26px] border border-border/60 bg-card/90 p-5 shadow-[0_12px_28px_-20px_rgba(15,23,42,0.14)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-card hover:shadow-[0_18px_34px_-22px_rgba(15,23,42,0.18)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${tipoVisual.badgeClass}`}
                          >
                            <TipoIcon className="size-3.5" />
                            {getTipoCalificacionLabel(template.tipo)}
                          </span>
                        </div>

                        <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                          {template.titulo}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {template.descripcion?.trim()
                            ? template.descripcion
                            : 'Sin descripción adicional.'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {template.detalles?.length > 0 ? (
                        template.detalles.map((detail, index) => (
                          <span
                            key={`${template.id}-${detail.skill}-${index}`}
                            className="inline-flex items-center rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground"
                          >
                            {getGradeTemplateSkillLabel(detail.skill)} · Máx. {detail.puntajeMaximo}
                          </span>
                        ))
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
                          Sin skills configuradas
                        </span>
                      )}
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        className="rounded-2xl border-border/70 bg-background/70 transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                        onClick={() =>
                          router.push(
                            `/teacher/courses/${courseId}/grade-templates/${template.id}/edit`
                          )
                        }
                      >
                        <Pencil className="mr-2 size-4" />
                        Editar
                      </Button>

                      <Button
                        variant="outline"
                        disabled={archivingId === template.id}
                        className="rounded-2xl border-border/70 bg-background/70 transition-all duration-200 hover:-translate-y-[1px] hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
                        onClick={() => handleArchive(template.id)}
                      >
                        <Archive className="mr-2 size-4" />
                        {archivingId === template.id ? 'Archivando...' : 'Archivar'}
                      </Button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}