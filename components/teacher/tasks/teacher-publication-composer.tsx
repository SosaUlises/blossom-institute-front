'use client'

import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
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

function safeText(value?: string | null) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function isImageResource(resource: ResourceDraft) {
  const contentType = safeText(resource.contentType)?.toLowerCase() ?? ''
  const name = safeText(resource.nombre)?.toLowerCase() ?? ''
  const url = safeText(resource.url)?.toLowerCase() ?? ''

  return (
    contentType.startsWith('image/') ||
    /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/.test(name) ||
    /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/.test(url)
  )
}

function ResourceImagePreview({ resource }: { resource: ResourceDraft }) {
  const url = safeText(resource.url)

  if (!url || resource.tipo === '1' || !isImageResource(resource)) return null

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="group block overflow-hidden rounded-xl border border-border/60 bg-background/50 transition-colors hover:border-primary/25 dark:bg-background/35"
    >
      <img
        src={url}
        alt={safeText(resource.nombre) ?? 'Imagen adjunta'}
        className="max-h-56 w-full bg-muted/20 object-contain transition-transform duration-200 group-hover:scale-[1.01]"
        loading="lazy"
      />
    </a>
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
    ? 'Armá una consigna para que el curso la entregue.'
    : 'Compartí una novedad o información importante con el curso.'

  return (
    <div className="space-y-4 pb-24 lg:pb-4">
      <header className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.025)] dark:bg-card/90 sm:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {mode === 'create' ? creationTitle : 'Editar publicación'}
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                {mode === 'create'
                  ? creationDescription
                  : isTask
                    ? 'Ajustá la consigna, los materiales o la fecha de entrega.'
                    : 'Actualizá el contenido que compartiste con el curso.'}
              </p>
            </div>

            {mode !== 'create' ? (
              <div className="flex shrink-0 flex-wrap items-center gap-2">
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
            ) : null}
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
          <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.025)] dark:bg-card/90 sm:p-5">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Título
                </label>
                <input
                  value={titulo}
                  onChange={(event) => onTituloChange(event.target.value)}
                  className="h-12 w-full rounded-xl border border-border/60 bg-background/70 px-3 text-base font-semibold text-foreground outline-none transition-all placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary dark:bg-background/35"
                  placeholder={
                    isTask
                      ? 'Ej: Homework 25/5'
                      : 'Ej: Cambio de horario de la clase'
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-muted-foreground">
                  {isTask ? 'Consigna' : 'Contenido del anuncio'}
                </label>
                <textarea
                  value={consigna}
                  onChange={(event) => onConsignaChange(event.target.value)}
                  rows={9}
                  className="min-h-52 w-full resize-y rounded-xl border border-border/60 bg-background/70 px-3 py-3 text-[15px] leading-7 text-foreground outline-none transition-all placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary dark:bg-background/35"
                  placeholder={
                    isTask
                      ? 'Escribí la consigna, indicaciones o materiales que necesita el curso.'
                      : 'Escribí el mensaje que querés compartir con el curso.'
                  }
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.025)] dark:bg-card/90 sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold tracking-tight text-foreground">
                  Recursos
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Materiales que acompañan la publicación.
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
                  className="rounded-xl border border-border/60 bg-background/55 p-3 dark:bg-background/30"
                >
                  <div className="mb-2.5 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <ResourceTypeBadge tipo={resource.tipo} />
                      <span className="truncate text-xs text-muted-foreground">
                        {resource.tipo === '1'
                          ? 'Material enlazado'
                          : 'Material adjunto'}
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-lg text-muted-foreground hover:bg-destructive/5 hover:text-destructive"
                      onClick={() => onRemoveResource(resource.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>

                  <div className="grid gap-2.5 md:grid-cols-[132px_minmax(0,1fr)]">
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-muted-foreground">
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
                      <label className="block text-xs font-medium text-muted-foreground">
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
                      <label className="block text-xs font-medium text-muted-foreground">
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

                    {resource.tipo !== '1' && isImageResource(resource) ? (
                      <div className="md:col-span-2">
                        <ResourceImagePreview resource={resource} />
                      </div>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-5">
          <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.025)] dark:bg-card/90">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Estado</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Controlá cuándo se ve en el tablón.
                  </p>
                </div>
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
            <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.025)] dark:bg-card/90">
              <div className="space-y-3">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    Fecha de entrega
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {mode === 'create'
                      ? 'Indicá cuándo debe entregar el curso.'
                      : 'Fecha límite para recibir entregas.'}
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

      <div className="mt-6 rounded-2xl border border-border/60 bg-card/95 p-3 shadow-[0_1px_2px_rgba(15,23,42,0.025)] dark:bg-card/90 sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0 pb-3 sm:pb-0">
          {error ? (
            <p className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-700 dark:text-rose-300">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </p>
          ) : success ? (
            <p className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              <span>{success}</span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {mode === 'create'
                ? 'Podés publicarlo ahora o guardarlo como borrador.'
                : 'Guardá los cambios cuando termines de ajustar la publicación.'}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          {mode === 'create' ? (
            <>
              <Button
                variant="outline"
                onClick={onSaveDraft}
                disabled={saving}
                className="h-10 rounded-xl border-border/70 bg-background/75 px-4 shadow-none"
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
    </div>
  )
}
