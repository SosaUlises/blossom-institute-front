'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Plus,
  Search,
  Archive,
  Pencil,
  ClipboardList,
  Sparkles,
  Eye,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RowActions } from '@/components/ui/row-actions'
import { AppHeader } from '@/components/layout/app-header'
import {
  TemplateSkillRows,
  TemplateTypeBadge,
} from './grade-template-ui'
import {
  archiveTeacherGradeTemplate,
  getTeacherGradeTemplateById,
  getTeacherGradeTemplates,
} from '@/lib/teacher/grade-templates/api'
import type {
  GradeTemplateDetail,
  GradeTemplateListItem,
} from '@/lib/teacher/grade-templates/types'
import { getTipoCalificacionLabel } from '@/lib/teacher/grade-templates/utils'

type Props = {
  courseId: number
  courseName: string
  courseYear: number
}

function formatTemplateDate(template: GradeTemplateListItem) {
  const rawDate = template.updatedAtUtc ?? template.createdAtUtc
  const label = template.updatedAtUtc ? 'Editada' : 'Creada'

  return `${label} ${new Date(rawDate).toLocaleDateString('es-AR')}`
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/50 py-3 last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

function TemplateDetailsModal({
  open,
  template,
  loading,
  onClose,
}: {
  open: boolean
  template: GradeTemplateDetail | null
  loading: boolean
  onClose: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-3 py-4 backdrop-blur-[2px] sm:px-4 sm:py-6">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.45)]">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-4 sm:px-5">
          <div>
            <p className="text-sm text-muted-foreground">Detalle de plantilla</p>
            <h3 className="mt-0.5 text-lg font-semibold tracking-tight text-foreground">
              Configuración reutilizable
            </h3>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="size-9 rounded-xl border-border/70 bg-background/75 shadow-none"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="max-h-[calc(90vh-73px)] overflow-y-auto px-4 py-4 sm:px-5">
          {loading ? (
            <div className="rounded-xl border border-dashed border-border/70 bg-background/40 px-4 py-10 text-center text-sm text-muted-foreground">
              Cargando detalle de plantilla...
            </div>
          ) : !template ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              No se pudo obtener el detalle de la plantilla.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border/60 bg-background/60 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)]">
                <div className="flex flex-wrap items-center gap-2">
                  <TemplateTypeBadge tipo={template.tipo} />
                  {template.tieneDetalleSkills && (
                    <span className="inline-flex items-center rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {template.detalles.length} habilidades
                    </span>
                  )}
                </div>

                <h4 className="mt-3 text-lg font-semibold tracking-tight text-foreground">
                  {template.titulo}
                </h4>

                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {template.descripcion?.trim()
                    ? template.descripcion
                    : 'Sin descripción adicional.'}
                </p>

                <p className="mt-3 text-xs text-muted-foreground">
                  {template.detalles.length} habilidades ·{' '}
                  {template.puntajeMaximoTotal != null
                    ? `${template.puntajeMaximoTotal} puntos`
                    : 'Sin puntaje total'}{' '}
                  · Creada {new Date(template.createdAtUtc).toLocaleDateString('es-AR')}
                </p>
              </div>

              <section className="rounded-2xl border border-border/60 bg-card/90 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)]">
                <div>
                  <DetailRow
                    label="Tipo"
                    value={getTipoCalificacionLabel(template.tipo)}
                  />
                  <DetailRow
                    label="Detalle por habilidades"
                    value={template.tieneDetalleSkills ? 'Sí' : 'No'}
                  />
                  <DetailRow
                    label="Puntaje máximo total"
                    value={
                      template.puntajeMaximoTotal != null
                        ? String(template.puntajeMaximoTotal)
                        : '—'
                    }
                  />
                  <DetailRow
                    label="Última actualización"
                    value={
                      template.updatedAtUtc
                        ? new Date(template.updatedAtUtc).toLocaleDateString('es-AR')
                        : 'Sin cambios posteriores'
                    }
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-border/60 bg-card/90 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)]">
                <h5 className="text-base font-semibold tracking-tight text-foreground">
                  Habilidades
                </h5>

                {template.detalles?.length ? (
                  <div className="mt-3">
                    <TemplateSkillRows detalles={template.detalles} />
                  </div>
                ) : (
                  <div className="mt-3 rounded-xl border border-dashed border-border/70 bg-background/40 px-4 py-5 text-center text-sm text-muted-foreground">
                    Sin habilidades configuradas.
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function TeacherGradeTemplateView({
  courseId,
  courseName,
}: Props) {
  const router = useRouter()

  const [templates, setTemplates] = useState<GradeTemplateListItem[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [archivingId, setArchivingId] = useState<number | null>(null)

  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<GradeTemplateDetail | null>(null)

  const loadTemplates = async (searchValue = search) => {
    try {
      setLoading(true)
      setError(null)

      const response = await getTeacherGradeTemplates(courseId, 1, 100, searchValue)
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
      loadTemplates(search)
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

  const handleViewDetails = async (templateId: number) => {
    try {
      setDetailOpen(true)
      setDetailLoading(true)
      setSelectedTemplate(null)
      setError(null)

      const detail = await getTeacherGradeTemplateById(courseId, templateId)
      setSelectedTemplate(detail)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo obtener el detalle de la plantilla.'
      )
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Evaluaciones" />

      <div className="space-y-4 p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-3">
            <Button
              variant="ghost"
              className="h-9 justify-start rounded-xl px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
              onClick={() => router.push(`/teacher/courses/${courseId}`)}
            >
              <ArrowLeft className="mr-2 size-4" />
              Volver al curso
            </Button>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Plantillas de calificación
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {courseName} · {templates.length} plantillas
              </p>
            </div>
          </div>

          <Button
            className="h-10 rounded-xl px-4 shadow-none"
            onClick={() =>
              router.push(`/teacher/courses/${courseId}/grade-templates/create`)
            }
          >
            <Plus className="mr-2 size-4" />
            Nueva plantilla
          </Button>
        </header>

        <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar plantilla..."
                className="h-10 rounded-xl border-border/60 bg-background/75 pl-10 shadow-none focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35"
              />
            </div>

            <p className="text-sm text-muted-foreground">
              {visibleTemplates.length} {visibleTemplates.length === 1 ? 'plantilla' : 'plantillas'}
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-background/40 px-4 py-10 text-center text-sm text-muted-foreground">
              Cargando plantillas...
            </div>
          ) : visibleTemplates.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-background/40 px-4 py-8 text-center">
              <div className="mx-auto flex max-w-sm flex-col items-center">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/8 text-primary">
                  <ClipboardList className="size-4.5" />
                </div>

                <h3 className="mt-3 text-base font-semibold tracking-tight text-foreground">
                  {search.trim()
                    ? 'No encontramos plantillas con esa búsqueda.'
                    : 'Sin plantillas todavía.'}
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  {search.trim()
                    ? 'Probá con otro término.'
                    : 'Creá una plantilla para reutilizarla al cargar calificaciones.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleTemplates.map((template) => {
                return (
                  <article
                    key={template.id}
                    className="group rounded-2xl border border-border/60 bg-background/55 p-4 transition-colors hover:border-primary/20 hover:bg-background/75"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <TemplateTypeBadge tipo={template.tipo} />
                          <span>{template.cantidadSkills ?? 0} habilidades</span>
                          <span className="hidden sm:inline">·</span>
                          <span>
                            {template.puntajeMaximoTotal != null
                              ? `${template.puntajeMaximoTotal} puntos`
                              : 'Sin puntaje total'}
                          </span>
                          <span className="hidden sm:inline">·</span>
                          <span>{formatTemplateDate(template)}</span>
                        </div>

                        <h3 className="mt-2 truncate text-base font-semibold tracking-tight text-foreground">
                          {template.titulo}
                        </h3>

                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                          {template.descripcion?.trim()
                            ? template.descripcion
                            : 'Sin descripción adicional.'}
                        </p>
                      </div>

                      <div className="flex w-full shrink-0 items-center gap-2 lg:w-auto">
                        <Button
                          className="h-10 w-full rounded-xl px-4 shadow-none focus-visible:ring-2 focus-visible:ring-primary/20 sm:w-auto"
                          onClick={() =>
                            router.push(
                              `/teacher/courses/${courseId}/grade-templates/${template.id}/apply`
                            )
                          }
                        >
                          <Sparkles className="mr-2 size-4" />
                          Usar con alumnos
                        </Button>

                        <RowActions
                          actions={[
                            {
                              label: 'Ver detalle',
                              icon: Eye,
                              onClick: () => handleViewDetails(template.id),
                            },
                            {
                              label: 'Editar',
                              icon: Pencil,
                              onClick: () =>
                                router.push(
                                  `/teacher/courses/${courseId}/grade-templates/${template.id}/edit`
                                ),
                            },
                            {
                              label:
                                archivingId === template.id ? 'Archivando...' : 'Archivar',
                              icon: Archive,
                              destructive: true,
                              onClick: () => handleArchive(template.id),
                            },
                          ]}
                        />
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>

      <TemplateDetailsModal
        open={detailOpen}
        template={selectedTemplate}
        loading={detailLoading}
        onClose={() => {
          setDetailOpen(false)
          setSelectedTemplate(null)
        }}
      />
    </div>
  )
}
