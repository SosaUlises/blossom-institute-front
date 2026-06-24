'use client'

import {
  CalendarClock,
  Link as LinkIcon,
  Megaphone,
  Paperclip,
  Plus,
  Trash2,
} from 'lucide-react'

import { FileUploadField } from '@/components/shared/file-upload-field'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  EstadoTarea,
  type TeacherTaskUpdateResourceInput,
} from '@/lib/teacher/tasks/types'
import type { UploadedFileResult } from '@/lib/uploads/api'
import { cn } from '@/lib/utils'

export type ResourceDraft = {
  id: string
  tipo: string
  url: string
  nombre: string
  storageProvider?: number | null
  storageKey?: string | null
  contentType?: string | null
  sizeBytes?: number | null
}

export function createEmptyResource(): ResourceDraft {
  return {
    id: crypto.randomUUID(),
    tipo: '1',
    url: '',
    nombre: '',
    storageProvider: null,
    storageKey: null,
    contentType: null,
    sizeBytes: null,
  }
}

export function toTaskResourcesPayload(
  resources: ResourceDraft[],
): TeacherTaskUpdateResourceInput[] {
  return resources
    .map(
      (resource): TeacherTaskUpdateResourceInput => ({
        tipo: Number(resource.tipo),
        url: resource.url.trim() || null,
        nombre: resource.nombre.trim() || null,
        storageProvider: resource.storageProvider ?? null,
        storageKey: resource.storageKey?.trim() || null,
        contentType: resource.contentType?.trim() || null,
        sizeBytes: resource.sizeBytes ?? null,
      }),
    )
    .filter((resource) => resource.url || resource.nombre)
}

type Props = {
  mode: 'create' | 'edit'
  publicationType?: 'task' | 'announcement'
  titulo: string
  consigna: string
  fechaEntregaUtc: string
  estado: string
  recursos: ResourceDraft[]
  saving: boolean
  error: string | null
  success: string | null
  onBack: () => void
  onTituloChange: (value: string) => void
  onConsignaChange: (value: string) => void
  onFechaEntregaChange: (value: string) => void
  onPublicationTypeChange?: (value: 'task' | 'announcement') => void
  onEstadoChange: (value: string) => void
  onAddResource: () => void
  onRemoveResource: (id: string) => void
  onChangeResource: (
    id: string,
    field: keyof Omit<ResourceDraft, 'id'>,
    value: string | number | null,
  ) => void
  onUploadedFile: (id: string, file: UploadedFileResult) => void
  onRemoveUploadedFile: (id: string) => void
  onSave: () => void
  onSaveDraft?: () => void
  onPublish?: () => void
}

const fieldClassName =
  'h-10 w-full rounded-xl border border-border/60 bg-background/75 px-3 text-sm outline-none transition-all focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary'

function EstadoBadge({ estado }: { estado: string }) {
  const config =
    estado === String(EstadoTarea.Borrador)
      ? 'border-slate-400/20 bg-slate-500/10 text-slate-600 dark:text-slate-300'
      : estado === String(EstadoTarea.Publicada)
        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
        : 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300'

  const label =
    estado === String(EstadoTarea.Borrador)
      ? 'Borrador'
      : estado === String(EstadoTarea.Publicada)
        ? 'Publicada'
        : 'Archivada'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
        config,
      )}
    >
      {label}
    </span>
  )
}

function ResourceTypeBadge({ tipo }: { tipo: string }) {
  const isLink = tipo === '1'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        isLink
          ? 'border-primary/15 bg-primary/5 text-primary'
          : 'border-amber-500/15 bg-amber-500/10 text-amber-700 dark:text-amber-300',
      )}
    >
      {isLink ? <LinkIcon className="size-3.5" /> : <Paperclip className="size-3.5" />}
      {isLink ? 'Link' : 'Archivo'}
    </span>
  )
}

export function TeacherPublicationComposer({
  mode,
  publicationType,
  titulo,
  consigna,
  fechaEntregaUtc,
  estado,
  recursos,
  saving,
  error,
  success,
  onTituloChange,
  onConsignaChange,
  onFechaEntregaChange,
  onPublicationTypeChange,
  onEstadoChange,
  onAddResource,
  onRemoveResource,
  onChangeResource,
  onUploadedFile,
  onRemoveUploadedFile,
  onSave,
  onSaveDraft,
  onPublish,
}: Props) {
  const resolvedPublicationType =
    mode === 'create' && publicationType
      ? publicationType
      : fechaEntregaUtc
        ? 'task'
        : 'announcement'
  const isTask = resolvedPublicationType === 'task'
  const creationTitle = isTask ? 'Crear tarea' : 'Crear anuncio'
  const creationDescription = isTask
    ? 'Prepará una actividad para que el alumnado la entregue.'
    : 'Compartí información con el curso sin solicitar una entrega.'

  return (
    <div className="space-y-4 pb-24 lg:pb-4">
      <header className="flex flex-col gap-3 border-b border-border/60 pb-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {isTask ? (
                <CalendarClock className="size-3.5" />
              ) : (
                <Megaphone className="size-3.5" />
              )}
              {isTask ? 'Tarea' : 'Anuncio'}
            </span>
            <EstadoBadge estado={estado} />
          </div>

          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {mode === 'create' ? creationTitle : 'Editar publicación'}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === 'create'
                ? creationDescription
                : isTask
                  ? 'Esta tarea admite entregas del alumnado.'
                  : 'Este anuncio comunica información sin solicitar entregas.'}
            </p>
          </div>

          {mode === 'create' && onPublicationTypeChange ? (
            <div className="flex w-fit items-center gap-1 rounded-xl border border-border/60 bg-muted/25 p-1">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                aria-pressed={isTask}
                onClick={() => onPublicationTypeChange('task')}
                className={cn(
                  'h-8 rounded-lg border border-transparent px-2.5 shadow-none transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.98]',
                  isTask && 'border-primary/20 bg-primary/10 text-primary',
                )}
              >
                <CalendarClock className="size-3.5" />
                Tarea
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                aria-pressed={!isTask}
                onClick={() => onPublicationTypeChange('announcement')}
                className={cn(
                  'h-8 rounded-lg border border-transparent px-2.5 shadow-none transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.98]',
                  !isTask && 'border-primary/20 bg-primary/10 text-primary',
                )}
              >
                <Megaphone className="size-3.5" />
                Anuncio
              </Button>
            </div>
          ) : null}
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-border/40 border-t-2 border-t-primary/60 bg-card p-6 shadow-sm dark:border-t-primary/50">
            <div className="space-y-4">
              <div className="space-y-2 [&>label]:mb-2 [&>label]:block">
                <label className="text-sm font-medium text-foreground">Título</label>
                <input
                  value={titulo}
                  onChange={(event) => onTituloChange(event.target.value)}
                  className={fieldClassName}
                  placeholder={isTask ? 'Título de la tarea' : 'Título del anuncio'}
                />
              </div>

              <div className="space-y-2">
                <label className="mb-2 block text-sm font-medium text-foreground">
                  {isTask ? 'Consigna' : 'Contenido del anuncio'}
                </label>
                <textarea
                  value={consigna}
                  onChange={(event) => onConsignaChange(event.target.value)}
                  rows={8}
                  className="min-h-44 w-full rounded-xl border border-border/60 bg-background/75 px-3 py-3 text-sm outline-none transition-all focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
                  placeholder={
                    isTask
                      ? 'Escribí la consigna de la tarea...'
                      : 'Escribí el contenido del anuncio...'
                  }
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold tracking-tight text-foreground">
                  Recursos
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Links y archivos visibles junto a la publicación.
                </p>
              </div>

              <Button
                variant="outline"
                className="h-9 rounded-lg border-border/70 bg-background/70 px-3 hover:border-primary/25 hover:bg-primary/5 hover:text-primary"
                onClick={onAddResource}
              >
                <Plus className="mr-2 size-4" />
                Agregar recurso
              </Button>
            </div>

            <div className="space-y-3">
              {recursos.map((resource) => (
                <article
                  key={resource.id}
                  className="rounded-xl border border-border/60 bg-background/65 p-3"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <ResourceTypeBadge tipo={resource.tipo} />

                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-lg text-muted-foreground hover:bg-destructive/5 hover:text-destructive"
                      onClick={() => onRemoveResource(resource.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-[140px_minmax(0,1fr)]">
                    <div className="space-y-2">
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        Tipo de recurso
                      </label>
                      <Select
                        value={resource.tipo}
                        onValueChange={(value) =>
                          onChangeResource(resource.id, 'tipo', value)
                        }
                      >
                        <SelectTrigger className="h-10 rounded-xl border-border/60 bg-background/75">
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border/60">
                          <SelectItem value="1">Link</SelectItem>
                          <SelectItem value="2">Archivo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        Nombre visible
                      </label>
                      <input
                        value={resource.nombre}
                        onChange={(event) =>
                          onChangeResource(resource.id, 'nombre', event.target.value)
                        }
                        className={fieldClassName}
                        placeholder="Nombre visible del recurso"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        {resource.tipo === '1' ? 'URL' : 'Archivo'}
                      </label>

                      {resource.tipo === '1' ? (
                        <div className="relative">
                          <LinkIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <input
                            value={resource.url}
                            onChange={(event) =>
                              onChangeResource(resource.id, 'url', event.target.value)
                            }
                            className={cn(fieldClassName, 'pl-10')}
                            placeholder="https://..."
                          />
                        </div>
                      ) : (
                        <FileUploadField
                          folder="tasks"
                          value={
                            resource.url
                              ? {
                                  url: resource.url,
                                  nombre: resource.nombre || 'Archivo',
                                  storageProvider: resource.storageProvider ?? null,
                                  storageKey: resource.storageKey ?? null,
                                  contentType: resource.contentType ?? null,
                                  sizeBytes: resource.sizeBytes ?? null,
                                }
                              : null
                          }
                          onUploaded={(file) => onUploadedFile(resource.id, file)}
                          onRemove={() => onRemoveUploadedFile(resource.id)}
                          label="Adjuntar archivo"
                        />
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-foreground">Publicación</h2>
                <EstadoBadge estado={estado} />
              </div>

              <Select value={estado} onValueChange={onEstadoChange}>
                <SelectTrigger className="h-10 rounded-xl border-border/60 bg-background/75">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/60">
                  <SelectItem value={String(EstadoTarea.Borrador)}>Borrador</SelectItem>
                  <SelectItem value={String(EstadoTarea.Publicada)}>Publicada</SelectItem>
                  <SelectItem value={String(EstadoTarea.Archivada)}>Archivada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>

          {mode === 'edit' || isTask ? (
            <section className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
              <div className="space-y-3">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    Fecha de entrega
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {mode === 'create'
                      ? 'Indicá cuándo debe entregar el alumnado.'
                      : 'Agregar una fecha convierte la publicación en tarea.'}
                  </p>
                </div>

                <div className="relative">
                  <CalendarClock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="datetime-local"
                    value={fechaEntregaUtc}
                    onChange={(event) => onFechaEntregaChange(event.target.value)}
                    className={cn(fieldClassName, 'pl-10')}
                    required={mode === 'create' && isTask}
                  />
                </div>
              </div>
            </section>
          ) : null}
        </aside>
      </div>

      {(error || success) && (
        <div className="space-y-3">
          {error ? (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-300">
              {success}
            </div>
          ) : null}
        </div>
      )}

      <div className="mt-8 flex items-center justify-end gap-3 border-t border-border/20 pt-6">
        {mode === 'create' ? (
          <>
            <Button
              variant="outline"
              onClick={onSaveDraft}
              disabled={saving}
              className="h-10 rounded-xl border-border/70 bg-background/75 px-4"
            >
              {saving ? 'Guardando...' : 'Guardar borrador'}
            </Button>
            <Button
              onClick={onPublish}
              disabled={saving}
              className="h-10 rounded-xl px-4 shadow-none"
            >
              {saving ? 'Guardando...' : 'Publicar'}
            </Button>
          </>
        ) : (
          <Button
            onClick={onSave}
            disabled={saving}
            className="h-10 rounded-xl px-4 shadow-none"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        )}
      </div>
    </div>
  )
}
