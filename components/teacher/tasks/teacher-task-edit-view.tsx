'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CalendarClock,
  Link as LinkIcon,
  Plus,
  Save,
  Trash2,
  Paperclip,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FileUploadField } from '@/components/shared/file-upload-field'
import {
  getTeacherTaskDetail,
  updateTeacherTask,
} from '@/lib/teacher/tasks/task-api'
import type {
  TeacherTaskUpdatePayload,
  TeacherTaskUpdateResourceInput,
} from '@/lib/teacher/tasks/types'
import { EstadoTarea } from '@/lib/teacher/tasks/types'
import type { UploadedFileResult } from '@/lib/uploads/api'
import { cn } from '@/lib/utils'

type Props = {
  courseId: number
  taskId: number
}

type ResourceDraft = {
  id: string
  tipo: string
  url: string
  nombre: string
  storageProvider?: number | null
  storageKey?: string | null
  contentType?: string | null
  sizeBytes?: number | null
}

function createEmptyResource(): ResourceDraft {
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

function ResourceTypeBadge({ tipo }: { tipo: string }) {
  const isLink = tipo === '1'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium',
        isLink
          ? 'border-primary/15 bg-primary/5 text-primary'
          : 'border-amber-500/15 bg-amber-500/10 text-amber-700 dark:text-amber-400',
      )}
    >
      {isLink ? <LinkIcon className="size-3.5" /> : <Paperclip className="size-3.5" />}
      {isLink ? 'Link' : 'Archivo'}
    </span>
  )
}

function EstadoBadgePreview({ estado }: { estado: string }) {
  const config =
    estado === String(EstadoTarea.Borrador)
      ? 'border-slate-400/20 bg-slate-500/10 text-slate-600 dark:text-slate-400'
      : estado === String(EstadoTarea.Publicada)
        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
        : 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400'

  const label =
    estado === String(EstadoTarea.Borrador)
      ? 'Borrador'
      : estado === String(EstadoTarea.Publicada)
        ? 'Publicada'
        : 'Archivada'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium',
        config,
      )}
    >
      {label}
    </span>
  )
}

export function TeacherTaskEditView({ courseId, taskId }: Props) {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [titulo, setTitulo] = useState('')
  const [consigna, setConsigna] = useState('')
  const [fechaEntregaUtc, setFechaEntregaUtc] = useState('')
  const [estado, setEstado] = useState(String(EstadoTarea.Borrador))
  const [recursos, setRecursos] = useState<ResourceDraft[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const task = await getTeacherTaskDetail(courseId, taskId)

        setTitulo(task.titulo)
        setConsigna(task.consigna ?? '')
        setEstado(String(task.estado))
        setFechaEntregaUtc(
          task.fechaEntregaUtc
            ? new Date(task.fechaEntregaUtc).toISOString().slice(0, 16)
            : '',
        )

        setRecursos(
          task.recursos.length > 0
            ? task.recursos.map((resource: any) => ({
                id: crypto.randomUUID(),
                tipo: String(resource.tipo),
                url: resource.url ?? '',
                nombre: resource.nombre ?? '',
                storageProvider: resource.storageProvider ?? null,
                storageKey: resource.storageKey ?? null,
                contentType: resource.contentType ?? null,
                sizeBytes: resource.sizeBytes ?? null,
              }))
            : [createEmptyResource()],
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocurrió un error.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [courseId, taskId])

  const handleAddResource = () => {
    setRecursos((prev) => [...prev, createEmptyResource()])
  }

  const handleRemoveResource = (id: string) => {
    setRecursos((prev) => {
      const updated = prev.filter((resource) => resource.id !== id)
      return updated.length > 0 ? updated : [createEmptyResource()]
    })
  }

  const handleChangeResource = (
    id: string,
    field: keyof Omit<ResourceDraft, 'id'>,
    value: string | number | null,
  ) => {
    setRecursos((prev) =>
      prev.map((resource) =>
        resource.id === id ? { ...resource, [field]: value } : resource,
      ),
    )
  }

  const handleUploadedFile = (id: string, file: UploadedFileResult) => {
    setRecursos((prev) =>
      prev.map((resource) =>
        resource.id === id
          ? {
              ...resource,
              tipo: '2',
              url: file.url,
              nombre: file.nombre,
              storageProvider: file.storageProvider ?? null,
              storageKey: file.storageKey ?? null,
              contentType: file.contentType ?? null,
              sizeBytes: file.sizeBytes ?? null,
            }
          : resource,
      ),
    )
  }

  const handleRemoveUploadedFile = (id: string) => {
    setRecursos((prev) =>
      prev.map((resource) =>
        resource.id === id
          ? {
              ...resource,
              url: '',
              nombre: '',
              storageProvider: null,
              storageKey: null,
              contentType: null,
              sizeBytes: null,
            }
          : resource,
      ),
    )
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const payload: TeacherTaskUpdatePayload = {
        titulo: titulo.trim(),
        consigna: consigna.trim() || null,
        fechaEntregaUtc: fechaEntregaUtc
          ? new Date(fechaEntregaUtc).toISOString()
          : null,
        estado: Number(estado),
        recursos: recursos
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
          .filter((resource) => resource.url || resource.nombre),
      }

      await updateTeacherTask(courseId, taskId, payload)

      setSuccess('Tarea actualizada correctamente.')
      setTimeout(() => {
        router.push(`/teacher/courses/${courseId}/tasks/${taskId}`)
      }, 700)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error al guardar.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-[24px] border border-border/60 bg-background/60 px-6 py-10 text-sm text-muted-foreground">
        Cargando tarea...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[28px] border border-border/60 bg-card/95 p-6 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.18)] md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.08),transparent_32%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.06),transparent_28%)]" />

        <div className="relative space-y-5">
          <Button
            variant="outline"
            className="rounded-2xl border-border/70 bg-background/70 transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
            onClick={() => router.push(`/teacher/courses/${courseId}/tasks/${taskId}`)}
          >
            <ArrowLeft className="mr-2 size-4" />
            Volver a la tarea
          </Button>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Save className="size-3.5" />
              Editar tarea
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Editar publicación
            </h1>

            <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
              Actualizá el contenido, el estado, la fecha de entrega y los recursos
              asociados a esta publicación.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-border/60 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
        <div className="mb-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Datos principales
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
            Configuración de la publicación
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-foreground">Título</label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="h-11 w-full rounded-2xl border border-border/70 bg-background/85 px-4 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] outline-none transition-all duration-200 focus:ring-4 focus:ring-primary/15"
              placeholder="Título de la tarea"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(240px,320px)_minmax(0,1fr)] md:col-span-2">
            <div className="rounded-[24px] border border-border/60 bg-background/70 p-4 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)]">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Estado de publicación
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Definí si la tarea queda en borrador, publicada o archivada.
                    </p>
                  </div>

                  <EstadoBadgePreview estado={estado} />
                </div>

                <Select value={estado} onValueChange={setEstado}>
                  <SelectTrigger className="h-11 rounded-2xl border-border/70 bg-background/90 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)]">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/60">
                    <SelectItem value={String(EstadoTarea.Borrador)}>Borrador</SelectItem>
                    <SelectItem value={String(EstadoTarea.Publicada)}>Publicada</SelectItem>
                    <SelectItem value={String(EstadoTarea.Archivada)}>Archivada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Fecha de entrega
              </label>

              <div className="relative">
                <CalendarClock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="datetime-local"
                  value={fechaEntregaUtc}
                  onChange={(e) => setFechaEntregaUtc(e.target.value)}
                  className="h-11 w-full rounded-2xl border border-border/70 bg-background/80 pl-10 pr-4 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] outline-none transition-all duration-200 focus:ring-4 focus:ring-primary/15"
                />
              </div>

              {!fechaEntregaUtc && (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-700 dark:text-amber-400">
                  Sin fecha de entrega, esta publicación se comporta como anuncio y
                  no admite entregas.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-foreground">Consigna</label>
            <textarea
              value={consigna}
              onChange={(e) => setConsigna(e.target.value)}
              rows={5}
              className="w-full rounded-2xl border border-border/70 bg-background/85 px-4 py-3 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] outline-none transition-all duration-200 focus:ring-4 focus:ring-primary/15"
              placeholder="Describí la consigna de la tarea..."
            />
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-border/60 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Recursos
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
              Material adjunto
            </h2>
          </div>

          <Button
            variant="outline"
            className="rounded-2xl border-border/70 bg-background/70 transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
            onClick={handleAddResource}
          >
            <Plus className="mr-2 size-4" />
            Agregar recurso
          </Button>
        </div>

        <div className="space-y-4">
          {recursos.map((resource) => (
            <div
              key={resource.id}
              className="rounded-[24px] border border-border/60 bg-background/75 p-5 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)]"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <ResourceTypeBadge tipo={resource.tipo} />

                <Button
                  variant="outline"
                  className="rounded-2xl border-border/70 bg-background/70 transition-all duration-200 hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
                  onClick={() => handleRemoveResource(resource.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)]">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Tipo</label>
                  <Select
                    value={resource.tipo}
                    onValueChange={(value) =>
                      handleChangeResource(resource.id, 'tipo', value)
                    }
                  >
                    <SelectTrigger className="h-11 rounded-2xl border-border/70 bg-background/85 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)]">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/60">
                      <SelectItem value="1">Link</SelectItem>
                      <SelectItem value="2">Archivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {resource.tipo === '1' ? 'URL' : 'Archivo'}
                  </label>

                  {resource.tipo === '1' ? (
                    <div className="relative">
                      <LinkIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        value={resource.url}
                        onChange={(e) =>
                          handleChangeResource(resource.id, 'url', e.target.value)
                        }
                        className="h-11 w-full rounded-2xl border border-border/70 bg-background/85 pl-10 pr-4 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] outline-none transition-all duration-200 focus:ring-4 focus:ring-primary/15"
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
                      onUploaded={(file) => handleUploadedFile(resource.id, file)}
                      onRemove={() => handleRemoveUploadedFile(resource.id)}
                      label="Subir archivo"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Nombre</label>
                  <input
                    value={resource.nombre}
                    onChange={(e) =>
                      handleChangeResource(resource.id, 'nombre', e.target.value)
                    }
                    className="h-11 w-full rounded-2xl border border-border/70 bg-background/85 px-4 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] outline-none transition-all duration-200 focus:ring-4 focus:ring-primary/15"
                    placeholder="Nombre visible del recurso"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
            {success}
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg active:translate-y-0 active:shadow-md"
          >
            <Save className="mr-2 size-4" />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </section>
    </div>
  )
}