'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CalendarClock,
  Link as LinkIcon,
  Paperclip,
  Plus,
  Save,
  Trash2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FileUploadField } from '@/components/shared/file-upload-field'
import { createTeacherTask } from '@/lib/teacher/tasks/task-api'
import type {
  TeacherTaskUpdatePayload,
  TeacherTaskUpdateResourceInput,
} from '@/lib/teacher/tasks/types'
import { EstadoTarea } from '@/lib/teacher/tasks/types'
import type { UploadedFileResult } from '@/lib/uploads/api'

type Props = {
  courseId: number
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

export function TeacherTaskCreateView({ courseId }: Props) {
  const router = useRouter()

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [titulo, setTitulo] = useState('')
  const [consigna, setConsigna] = useState('')
  const [fechaEntregaUtc, setFechaEntregaUtc] = useState('')
  const [estado, setEstado] = useState(String(EstadoTarea.Publicada))
  const [recursos, setRecursos] = useState<ResourceDraft[]>([createEmptyResource()])

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
    value: string | number | null
  ) => {
    setRecursos((prev) =>
      prev.map((resource) =>
        resource.id === id ? { ...resource, [field]: value } : resource
      )
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
          : resource
      )
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
          : resource
      )
    )
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      if (!titulo.trim()) {
        throw new Error('El título es obligatorio.')
      }

      const recursosPayload = recursos
        .map((resource): TeacherTaskUpdateResourceInput => ({
          tipo: Number(resource.tipo),
          url: resource.url.trim() || null,
          nombre: resource.nombre.trim() || null,
          storageProvider: resource.storageProvider ?? null,
          storageKey: resource.storageKey?.trim() || null,
          contentType: resource.contentType?.trim() || null,
          sizeBytes: resource.sizeBytes ?? null,
        }))
        .filter((resource) => resource.url || resource.nombre)

      const payload: TeacherTaskUpdatePayload = {
        titulo: titulo.trim(),
        consigna: consigna.trim() || null,
        fechaEntregaUtc: fechaEntregaUtc ? new Date(fechaEntregaUtc).toISOString() : null,
        estado: Number(estado),
        recursos: recursosPayload,
      }

      const created = await createTeacherTask(courseId, payload)

      setSuccess('Tarea creada correctamente.')

      setTimeout(() => {
        if (created?.id) {
          router.push(`/teacher/courses/${courseId}/tasks/${created.id}`)
          return
        }

        router.push(`/teacher/courses/${courseId}`)
      }, 700)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error al crear.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[28px] border border-border/60 bg-card/95 p-6 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.18)] md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.08),transparent_32%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.06),transparent_28%)]" />

        <div className="relative space-y-5">
          <Button
            variant="outline"
            className="rounded-2xl border-border/70 bg-background/70 transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
            onClick={() => router.push(`/teacher/courses/${courseId}`)}
          >
            <ArrowLeft className="mr-2 size-4" />
            Volver al curso
          </Button>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Save className="size-3.5" />
              Create task
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Crear tarea
            </h1>

            <p className="text-sm leading-6 text-muted-foreground">
              Cargá título, consigna, fecha de entrega y recursos para publicar una nueva tarea.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-border/60 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Estado</label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="flex h-11 w-full rounded-2xl border border-border/70 bg-background/85 px-3 py-2 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] outline-none transition-all duration-200 focus:ring-4 focus:ring-primary/15"
            >
              <option value={EstadoTarea.Borrador}>Borrador</option>
              <option value={EstadoTarea.Publicada}>Publicada</option>
              <option value={EstadoTarea.Archivada}>Archivada</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Fecha de entrega</label>
            <div className="relative">
              <CalendarClock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="datetime-local"
                value={fechaEntregaUtc}
                onChange={(e) => setFechaEntregaUtc(e.target.value)}
                className="h-11 w-full rounded-2xl border border-border/70 bg-background/85 pl-10 pr-4 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] outline-none transition-all duration-200 focus:ring-4 focus:ring-primary/15"
              />
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
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Resources
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
              Recursos
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
              className="rounded-[24px] border border-border/60 bg-background/75 p-4 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)]"
            >
              <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)_auto]">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Tipo</label>
                  <select
                    value={resource.tipo}
                    onChange={(e) => handleChangeResource(resource.id, 'tipo', e.target.value)}
                    className="flex h-11 w-full rounded-2xl border border-border/70 bg-background/85 px-3 py-2 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] outline-none transition-all duration-200 focus:ring-4 focus:ring-primary/15"
                  >
                    <option value="1">Link</option>
                    <option value="2">Archivo</option>
                  </select>
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
                        onChange={(e) => handleChangeResource(resource.id, 'url', e.target.value)}
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
                    onChange={(e) => handleChangeResource(resource.id, 'nombre', e.target.value)}
                    className="h-11 w-full rounded-2xl border border-border/70 bg-background/85 px-4 text-sm shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] outline-none transition-all duration-200 focus:ring-4 focus:ring-primary/15"
                    placeholder="Nombre visible del recurso"
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    className="rounded-2xl border-border/70 bg-background/70 transition-all duration-200 hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
                    onClick={() => handleRemoveResource(resource.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-600 dark:text-green-400">
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
            {saving ? 'Guardando...' : 'Crear tarea'}
          </Button>
        </div>
      </section>
    </div>
  )
}