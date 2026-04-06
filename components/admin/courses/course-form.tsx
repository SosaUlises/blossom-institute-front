'use client'

import { useMemo, useState } from 'react'
import { Loader2, Plus, Trash2, CalendarClock, BookOpen, AlignLeft, CalendarRange } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import type {
  CreateCursoDTO,
  CursoById,
  CursoHorario,
  UpdateCursoDTO,
} from '@/lib/admin/courses/types'

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
        ? 'Modificá la información general del curso y actualizá su configuración horaria.'
        : 'Ingresá la información principal del curso y definí sus horarios disponibles.',
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
    <Card className="overflow-hidden rounded-[28px] border border-border/60 bg-card/95 text-card-foreground shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
      <CardHeader className="border-b border-border/50 pb-5">
        <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
          {title}
        </CardTitle>
        <CardDescription className="text-sm leading-6 text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 sm:p-7">
        <form onSubmit={handleSubmit}>
          <FieldGroup className="space-y-7">
            {error && (
              <Alert className="rounded-2xl border-destructive/25 bg-destructive/5 text-destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="nombre" className="mb-2.5 text-sm font-semibold text-foreground">
                  Nombre
                </FieldLabel>
                <div className="relative">
                  <BookOpen className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="nombre"
                    value={form.nombre}
                    onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Inglés Inicial A"
                    required
                    disabled={isLoading}
                    className="h-12 rounded-2xl border-border/80 bg-background/90 pl-11 pr-4 text-[15px] shadow-none placeholder:text-muted-foreground/80 transition-all duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
                  />
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="anio" className="mb-2.5 text-sm font-semibold text-foreground">
                  Año
                </FieldLabel>
                <div className="relative">
                  <CalendarRange className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="anio"
                    value={form.anio}
                    onChange={(e) => setForm((prev) => ({ ...prev, anio: e.target.value }))}
                    placeholder="2026"
                    required
                    disabled={isLoading}
                    className="h-12 rounded-2xl border-border/80 bg-background/90 pl-11 pr-4 text-[15px] shadow-none placeholder:text-muted-foreground/80 transition-all duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
                  />
                </div>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="descripcion" className="mb-2.5 text-sm font-semibold text-foreground">
                Descripción
              </FieldLabel>
              <div className="relative">
                <AlignLeft className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="descripcion"
                  value={form.descripcion}
                  onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Descripción del curso"
                  disabled={isLoading}
                  className="h-12 rounded-2xl border-border/80 bg-background/90 pl-11 pr-4 text-[15px] shadow-none placeholder:text-muted-foreground/80 transition-all duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
                />
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="estado" className="mb-2.5 text-sm font-semibold text-foreground">
                Estado
              </FieldLabel>
              <select
                id="estado"
                value={form.estado}
                onChange={(e) => setForm((prev) => ({ ...prev, estado: e.target.value }))}
                disabled={isLoading}
                className="flex h-12 w-full rounded-2xl border border-border/80 bg-background/90 px-4 py-2 text-sm shadow-none transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/15"
              >
                {estadoOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>

            <div className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <FieldLabel className="text-sm font-semibold text-foreground">
                    Horarios
                  </FieldLabel>
                  <p className="text-sm text-muted-foreground">
                    Definí uno o varios bloques horarios para el curso.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addHorario}
                  className="h-10 rounded-2xl border-border/70 bg-background/75 px-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-primary/30 "
                >
                  <Plus className="mr-2 size-4" />
                  Agregar horario
                </Button>
              </div>

              <div className="space-y-3">
                {form.horarios.map((horario, index) => (
                  <div
                    key={index}
                    className="grid gap-3 rounded-[24px] border border-border/60 bg-background/70 p-4 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)] md:grid-cols-[1.25fr_1fr_1fr_auto]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="hidden size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary md:flex">
                        <CalendarClock className="size-4" />
                      </div>

                      <select
                        value={horario.dia}
                        onChange={(e) => handleHorarioChange(index, 'dia', Number(e.target.value))}
                        className="flex h-11 w-full rounded-2xl border border-border/70 bg-card px-3 py-2 text-sm shadow-none transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/15"
                        disabled={isLoading}
                      >
                        {dayOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Input
                      type="time"
                      value={horario.horaInicio}
                      onChange={(e) => handleHorarioChange(index, 'horaInicio', e.target.value)}
                      disabled={isLoading}
                      className="h-11 rounded-2xl border-border/70 bg-card shadow-none transition-all duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
                    />

                    <Input
                      type="time"
                      value={horario.horaFin}
                      onChange={(e) => handleHorarioChange(index, 'horaFin', e.target.value)}
                      disabled={isLoading}
                      className="h-11 rounded-2xl border-border/70 bg-card shadow-none transition-all duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeHorario(index)}
                      disabled={isLoading || form.horarios.length === 1}
                      className="h-11 w-11 rounded-2xl text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                className="min-w-40 rounded-2xl bg-primary px-5 text-[15px] font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg active:translate-y-0 active:shadow-md"
                disabled={isLoading}
              >
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