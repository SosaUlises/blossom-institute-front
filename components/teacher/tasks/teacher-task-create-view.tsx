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
    setRecursos((prev) => prev.filter((resource) => resource.id !== id))
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

      const payload: TeacherTaskUpdatePayload = {
        titulo: titulo.trim(),
        consigna: consigna.trim() || null,
        fechaEntregaUtc: fechaEntregaUtc
          ? new Date(fechaEntregaUtc).toISOString()
          : null,
        estado: Number(estado),
        recursos: recursos.map((resource): TeacherTaskUpdateResourceInput => ({
          tipo: Number(resource.tipo),
          url: resource.url.trim() || null,
          nombre: resource.nombre.trim() || null,
          storageProvider: resource.storageProvider ?? null,
          storageKey: resource.storageKey?.trim() || null,
          contentType: resource.contentType?.trim() || null,
          sizeBytes: resource.sizeBytes ?? null,
        })),
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
      <section className="rounded-[30px] border border-border/70 bg-card/95 p-6 shadow-[0_24px_60px_-28px_rgba(30,42,68,0.24)] md:p-8">
        <div className="space-y-5">
          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={() => router.push(`/teacher/courses/${courseId}`)}
          >
            <ArrowLeft className="mr-2 size-4" />
            Volver al curso
          </Button>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Crear tarea
            </h1>

            <p className="text-sm leading-6 text-muted-foreground">
              Cargá título, consigna, fecha de entrega y recursos para publicar una nueva tarea.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-border/70 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(30,42,68,0.18)]">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-foreground">Título</label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="h-11 w-full rounded-2xl border border-border/70 bg-background/80 px-4 text-sm outline-none"
              placeholder="Título de la tarea"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Estado</label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="flex h-11 w-full rounded-2xl border border-border/70 bg-background/80 px-3 py-2 text-sm shadow-sm outline-none"
            >
              <option value={EstadoTarea.Borrador}>Borrador</option>
              <option value={EstadoTarea.Publicada}>Publicada</option>
              <option value={EstadoTarea.Archivada}>Archivada</option>
            </select>
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
                className="h-11 w-full rounded-2xl border border-border/70 bg-background/80 pl-10 pr-4 text-sm outline-none"
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-foreground">Consigna</label>
            <textarea
              value={consigna}
              onChange={(e) => setConsigna(e.target.value)}
              rows={5}
              className="w-full rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm outline-none"
              placeholder="Describí la consigna de la tarea..."
            />
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-border/70 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(30,42,68,0.18)]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Resources
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
              Recursos
            </h2>
          </div>

          <Button variant="outline" className="rounded-2xl" onClick={handleAddResource}>
            <Plus className="mr-2 size-4" />
            Agregar recurso
          </Button>
        </div>

        <div className="space-y-4">
          {recursos.map((resource) => (
            <div
              key={resource.id}
              className="rounded-[24px] border border-border/70 bg-background/75 p-4"
            >
              <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)_auto]">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Tipo</label>
                  <select
                    value={resource.tipo}
                    onChange={(e) =>
                      handleChangeResource(resource.id, 'tipo', e.target.value)
                    }
                    className="flex h-11 w-full rounded-2xl border border-border/70 bg-background/80 px-3 py-2 text-sm shadow-sm outline-none"
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
                        onChange={(e) =>
                          handleChangeResource(resource.id, 'url', e.target.value)
                        }
                        className="h-11 w-full rounded-2xl border border-border/70 bg-background/80 pl-10 pr-4 text-sm outline-none"
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
                    className="h-11 w-full rounded-2xl border border-border/70 bg-background/80 px-4 text-sm outline-none"
                    placeholder="Nombre visible del recurso"
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    className="rounded-2xl"
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
          <Button onClick={handleSave} disabled={saving} className="rounded-2xl">
            <Save className="mr-2 size-4" />
            {saving ? 'Guardando...' : 'Crear tarea'}
          </Button>
        </div>
      </section>
    </div>
  )
}