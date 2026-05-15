'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import {
  TeacherPublicationComposer,
  createEmptyResource,
  toTaskResourcesPayload,
  type ResourceDraft,
} from '@/components/teacher/tasks/teacher-publication-composer'
import {
  getTeacherTaskDetail,
  updateTeacherTask,
} from '@/lib/teacher/tasks/task-api'
import { EstadoTarea, type TeacherTaskUpdatePayload } from '@/lib/teacher/tasks/types'
import type { UploadedFileResult } from '@/lib/uploads/api'

type Props = {
  courseId: number
  taskId: number
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
        recursos: toTaskResourcesPayload(recursos),
      }

      await updateTeacherTask(courseId, taskId, payload)

      setSuccess('Publicación actualizada correctamente.')
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
      <div className="rounded-2xl border border-border/60 bg-background/60 px-5 py-8 text-sm text-muted-foreground">
        Cargando tarea...
      </div>
    )
  }

  return (
    <TeacherPublicationComposer
      mode="edit"
      titulo={titulo}
      consigna={consigna}
      fechaEntregaUtc={fechaEntregaUtc}
      estado={estado}
      recursos={recursos}
      saving={saving}
      error={error}
      success={success}
      onBack={() => router.push(`/teacher/courses/${courseId}/tasks/${taskId}`)}
      onTituloChange={setTitulo}
      onConsignaChange={setConsigna}
      onFechaEntregaChange={setFechaEntregaUtc}
      onEstadoChange={setEstado}
      onAddResource={handleAddResource}
      onRemoveResource={handleRemoveResource}
      onChangeResource={handleChangeResource}
      onUploadedFile={handleUploadedFile}
      onRemoveUploadedFile={handleRemoveUploadedFile}
      onSave={() => void handleSave()}
    />
  )
}
