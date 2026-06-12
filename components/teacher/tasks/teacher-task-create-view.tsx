'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import {
  TeacherPublicationComposer,
  createEmptyResource,
  toTaskResourcesPayload,
  type ResourceDraft,
} from '@/components/teacher/tasks/teacher-publication-composer'
import { createTeacherTask } from '@/lib/teacher/tasks/task-api'
import { EstadoTarea, type TeacherTaskUpdatePayload } from '@/lib/teacher/tasks/types'
import type { UploadedFileResult } from '@/lib/uploads/api'

export type PublicationType = 'task' | 'announcement'

type Props = {
  courseId: number
  initialType: PublicationType
}

export function TeacherTaskCreateView({ courseId, initialType }: Props) {
  const router = useRouter()

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [titulo, setTitulo] = useState('')
  const [consigna, setConsigna] = useState('')
  const [fechaEntregaUtc, setFechaEntregaUtc] = useState('')
  const [publicationType, setPublicationType] =
    useState<PublicationType>(initialType)
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

  const handleSave = async (nextEstado = estado) => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)
      setEstado(nextEstado)

      if (!titulo.trim()) {
        throw new Error('El título es obligatorio.')
      }

      if (publicationType === 'task' && !fechaEntregaUtc) {
        throw new Error('Elegí una fecha de entrega para crear la tarea.')
      }

      const payload: TeacherTaskUpdatePayload = {
        titulo: titulo.trim(),
        consigna: consigna.trim() || null,
        fechaEntregaUtc: fechaEntregaUtc
          ? new Date(fechaEntregaUtc).toISOString()
          : null,
        estado: Number(nextEstado),
        recursos: toTaskResourcesPayload(recursos),
      }

      const created = await createTeacherTask(courseId, payload)

      setSuccess(
        publicationType === 'task'
          ? 'Tarea creada correctamente.'
          : 'Anuncio creado correctamente.',
      )

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
    <TeacherPublicationComposer
      mode="create"
      publicationType={publicationType}
      titulo={titulo}
      consigna={consigna}
      fechaEntregaUtc={fechaEntregaUtc}
      estado={estado}
      recursos={recursos}
      saving={saving}
      error={error}
      success={success}
      onBack={() => router.push(`/teacher/courses/${courseId}`)}
      onTituloChange={setTitulo}
      onConsignaChange={setConsigna}
      onFechaEntregaChange={setFechaEntregaUtc}
      onPublicationTypeChange={(value) => {
        setPublicationType(value)
        if (value === 'announcement') setFechaEntregaUtc('')
      }}
      onEstadoChange={setEstado}
      onAddResource={handleAddResource}
      onRemoveResource={handleRemoveResource}
      onChangeResource={handleChangeResource}
      onUploadedFile={handleUploadedFile}
      onRemoveUploadedFile={handleRemoveUploadedFile}
      onSave={() => void handleSave()}
      onSaveDraft={() => void handleSave(String(EstadoTarea.Borrador))}
      onPublish={() => void handleSave(String(EstadoTarea.Publicada))}
    />
  )
}
