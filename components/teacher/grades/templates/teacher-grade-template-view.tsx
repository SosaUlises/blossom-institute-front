'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Search,
  Archive,
  Pencil,
  ClipboardList,
  Sparkles,
  Eye,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RowActions } from '@/components/ui/row-actions'
import { AppHeader } from '@/components/layout/app-header'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto rounded-2xl border-border/60 bg-card p-4 sm:p-5">
        <DialogHeader className="text-left">
          <DialogTitle>Detalle de plantilla</DialogTitle>
          <DialogDescription>
            Estructura reutilizable para cargar calificaciones.
          </DialogDescription>
        </DialogHeader>

        <div>
          {loading ? (
            <div className="space-y-3 py-2">
              <div className="h-6 w-44 animate-pulse rounded-md bg-muted/40" />
              <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted/30" />
              <div className="h-28 animate-pulse rounded-xl bg-muted/20" />
            </div>
          ) : !template ? (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              No se pudo obtener el detalle de la plantilla.
            </div>
          ) : (
            <div className="space-y-3">
              <section className="rounded-xl border border-border/60 bg-background/60 p-4 dark:bg-background/35">
                <div className="flex flex-wrap items-center gap-2">
                  <TemplateTypeBadge tipo={template.tipo} />
                  {template.detalles.length > 0 ? (
                    <span className="inline-flex items-center rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {template.detalles.length} habilidades
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      Nota directa
                    </span>
                  )}
                  {template.puntajeMaximoTotal != null && (
                    <span className="inline-flex items-center rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {template.puntajeMaximoTotal} puntos
                    </span>
                  )}
                </div>

                <h3 className="mt-3 text-lg font-semibold tracking-tight text-foreground">
                  {template.titulo}
                </h3>

                {template.descripcion?.trim() && (
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {template.descripcion}
                  </p>
                )}

                <p className="mt-3 text-xs text-muted-foreground">
                  Creada {new Date(template.createdAtUtc).toLocaleDateString('es-AR')}
                  {template.updatedAtUtc
                    ? ` · Editada ${new Date(template.updatedAtUtc).toLocaleDateString(
                        'es-AR'
                      )}`
                    : ''}
                </p>
              </section>

              {template.detalles?.length ? (
                <section className="rounded-xl border border-border/60 bg-background/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-base font-semibold tracking-tight text-foreground">
                      Habilidades
                    </h4>
                    {template.puntajeMaximoTotal != null && (
                      <span className="text-xs font-medium text-muted-foreground">
                        {template.puntajeMaximoTotal} puntos en total
                      </span>
                    )}
                  </div>
                  <div className="mt-3">
                    <TemplateSkillRows detalles={template.detalles} />
                  </div>
                </section>
              ) : (
                <div className="rounded-xl border border-border/60 bg-background/40 px-4 py-3 text-sm text-muted-foreground">
                  Esta plantilla usa una nota directa, sin desglose por habilidades.
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
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
  const [templateToArchive, setTemplateToArchive] =
    useState<GradeTemplateListItem | null>(null)

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

  const handleArchive = async () => {
    if (!templateToArchive) return

    try {
      setArchivingId(templateToArchive.id)
      setError(null)

      await archiveTeacherGradeTemplate(courseId, templateToArchive.id)
      await loadTemplates()
      setTemplateToArchive(null)
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
    <>
      <AppHeader title="Evaluaciones" />

      <main className="flex-1 overflow-auto px-4 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-5xl space-y-4">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {courseName}
            </p>
            <div>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                Plantillas de calificación
              </h1>
              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">
                Guardá estructuras de evaluación para reutilizarlas al cargar notas.
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

        <section className="rounded-2xl border border-border/60 bg-card/95 p-3 shadow-[0_1px_2px_rgba(15,23,42,0.025)] sm:p-4">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <label htmlFor="template-search" className="sr-only">
                Buscar plantilla
              </label>
              <Input
                id="template-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar plantilla..."
                className="h-10 rounded-xl border-border/60 bg-background/75 pl-10 shadow-none focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35"
              />
            </div>

            <p className="text-sm text-muted-foreground">
              {visibleTemplates.length} {visibleTemplates.length === 1 ? 'plantilla disponible' : 'plantillas disponibles'}
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-2.5">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-border/60 bg-background/50 p-4"
                >
                  <div className="h-5 w-2/5 animate-pulse rounded-md bg-muted/40" />
                  <div className="mt-3 h-4 w-3/4 animate-pulse rounded-md bg-muted/30" />
                </div>
              ))}
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
                const skillsCount = template.cantidadSkills ?? 0
                const hasSkills = skillsCount > 0

                return (
                  <article
                    key={template.id}
                    className="group rounded-xl border border-border/60 bg-background/55 p-3.5 transition-colors hover:border-primary/20 hover:bg-background/75 sm:p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-semibold tracking-tight text-foreground">
                          {template.titulo}
                        </h3>

                        {template.descripcion?.trim() && (
                          <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                            {template.descripcion}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <TemplateTypeBadge tipo={template.tipo} />
                          <span className="inline-flex items-center rounded-full border border-border/60 bg-background/65 px-2.5 py-1 font-medium">
                            {hasSkills ? `${skillsCount} habilidades` : 'Nota directa'}
                          </span>
                          {template.puntajeMaximoTotal != null && (
                            <span className="inline-flex items-center rounded-full border border-border/60 bg-background/65 px-2.5 py-1 font-medium">
                              {template.puntajeMaximoTotal} puntos
                            </span>
                          )}
                          <span>{formatTemplateDate(template)}</span>
                        </div>

                      </div>

                      <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
                        <Button
                          className="h-9 w-full rounded-xl px-3.5 shadow-none focus-visible:ring-2 focus-visible:ring-primary/20 sm:w-auto"
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
                              onClick: () => setTemplateToArchive(template),
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
      </main>

      <TemplateDetailsModal
        open={detailOpen}
        template={selectedTemplate}
        loading={detailLoading}
        onClose={() => {
          setDetailOpen(false)
          setSelectedTemplate(null)
        }}
      />

      <AlertDialog
        open={templateToArchive !== null}
        onOpenChange={(open) => {
          if (!open && archivingId === null) setTemplateToArchive(null)
        }}
      >
        <AlertDialogContent className="rounded-2xl border-border/60">
          <AlertDialogHeader>
            <AlertDialogTitle>Archivar plantilla</AlertDialogTitle>
            <AlertDialogDescription>
              {templateToArchive
                ? `“${templateToArchive.titulo}” dejará de estar disponible para nuevas calificaciones.`
                : 'La plantilla dejará de estar disponible.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={archivingId !== null}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={archivingId !== null}
              onClick={(event) => {
                event.preventDefault()
                void handleArchive()
              }}
              className="bg-amber-600 text-white hover:bg-amber-700"
            >
              {archivingId !== null ? 'Archivando...' : 'Archivar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
