'use client'

import { useMemo, useState } from 'react'
import { Loader2, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import type {
  CreateCursoDTO,
  CursoById,
  CursoHorario,
  EstadoCurso,
  UpdateCursoDTO,
} from '@/lib/courses/types'

interface CourseFormProps {
  mode: 'create' | 'edit'
  initialData?: CursoById
  onSubmit: (payload: CreateCursoDTO | UpdateCursoDTO) => Promise<void>
}

const dayOptions = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
]

const estadoOptions = [
  { value: 1, label: 'Activo' },
  { value: 2, label: 'Inactivo' },
  { value: 3, label: 'Archivado' },
]

export function CourseForm({ mode, initialData, onSubmit }: CourseFormProps) {
  const isEdit = mode === 'edit'

  const [form, setForm] = useState({
    nombre: initialData?.nombre ?? '',
    anio: initialData?.anio ? String(initialData.anio) : '',
    descripcion: initialData?.descripcion ?? '',
    estado: String(initialData?.estado ?? 1),
    horarios:
      initialData?.horarios?.length
        ? initialData.horarios.map((h) => ({
            dia: h.dia,
            horaInicio: h.horaInicio,
            horaFin: h.horaFin,
          }))
        : [{ dia: 1, horaInicio: '18:00', horaFin: '19:00' }],
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const title = useMemo(
    () => (isEdit ? 'Actualizar curso' : 'Crear curso'),
    [isEdit]
  )

  const description = useMemo(
    () =>
      isEdit
        ? ''
        : '',
    [isEdit]
  )

  const handleHorarioChange = (
    index: number,
    field: keyof CursoHorario,
    value: string | number
  ) => {
    setForm((prev) => {
      const updated = [...prev.horarios]
      updated[index] = {
        ...updated[index],
        [field]: value,
      }
      return { ...prev, horarios: updated }
    })
  }

  const addHorario = () => {
    setForm((prev) => ({
      ...prev,
      horarios: [...prev.horarios, { dia: 1, horaInicio: '18:00', horaFin: '19:00' }],
    }))
  }

  const removeHorario = (index: number) => {
    setForm((prev) => ({
      ...prev,
      horarios: prev.horarios.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const anio = Number(form.anio)
      const estado = Number(form.estado)

      if (!form.nombre.trim()) throw new Error('El nombre es obligatorio.')
      if (Number.isNaN(anio)) throw new Error('El año debe ser numérico.')
      if (!form.horarios.length) throw new Error('Agregá al menos un horario.')

      const horarios = form.horarios.map((h) => ({
        dia: Number(h.dia),
        horaInicio: h.horaInicio,
        horaFin: h.horaFin,
      }))

      const payload = {
        nombre: form.nombre.trim(),
        anio,
        descripcion: form.descripcion.trim(),
        estado,
        horarios,
      }

      await onSubmit(payload as CreateCursoDTO | UpdateCursoDTO)
    } catch (err: any) {
      setError(err?.message || 'No se pudo guardar el curso.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-border/70 bg-card/95 text-card-foreground shadow-[0_18px_50px_-24px_rgba(30,42,68,0.25)]">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold tracking-tight">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="space-y-6">
            {error && (
              <Alert variant="destructive" className="border-destructive/20">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="nombre">Nombre</FieldLabel>
                <Input
                  id="nombre"
                  value={form.nombre}
                  onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Inglés Inicial A"
                  required
                  disabled={isLoading}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="anio">Año</FieldLabel>
                <Input
                  id="anio"
                  value={form.anio}
                  onChange={(e) => setForm((prev) => ({ ...prev, anio: e.target.value }))}
                  placeholder="2026"
                  required
                  disabled={isLoading}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="descripcion">Descripción</FieldLabel>
              <Input
                id="descripcion"
                value={form.descripcion}
                onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Descripción del curso"
                disabled={isLoading}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="estado">Estado</FieldLabel>
              <select
                id="estado"
                value={form.estado}
                onChange={(e) => setForm((prev) => ({ ...prev, estado: e.target.value }))}
                disabled={isLoading}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              >
                {estadoOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FieldLabel>Horarios</FieldLabel>
                <Button type="button" variant="outline" size="sm" onClick={addHorario}>
                  <Plus className="mr-2 size-4" />
                  Agregar horario
                </Button>
              </div>

              <div className="space-y-3">
                {form.horarios.map((horario, index) => (
                  <div
                    key={index}
                    className="grid gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4 md:grid-cols-[1fr_1fr_1fr_auto]"
                  >
                    <select
                      value={horario.dia}
                      onChange={(e) => handleHorarioChange(index, 'dia', Number(e.target.value))}
                      className="flex h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm"
                      disabled={isLoading}
                    >
                      {dayOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <Input
                      type="time"
                      value={horario.horaInicio}
                      onChange={(e) => handleHorarioChange(index, 'horaInicio', e.target.value)}
                      disabled={isLoading}
                    />

                    <Input
                      type="time"
                      value={horario.horaFin}
                      onChange={(e) => handleHorarioChange(index, 'horaFin', e.target.value)}
                      disabled={isLoading}
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeHorario(index)}
                      disabled={isLoading || form.horarios.length === 1}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" className="min-w-40" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Guardando...
                  </>
                ) : isEdit ? (
                  'Guardar cambios'
                ) : (
                  'Crear curso'
                )}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}