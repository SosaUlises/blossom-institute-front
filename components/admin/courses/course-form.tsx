'use client'

import { useState } from 'react'
import {
  Loader2,
  Plus,
  Trash2,
  BookOpen,
  AlignLeft,
  CalendarRange,
  Sparkles,
  Clock3,
  Settings2,
  BadgeCheck,
  CalendarClock,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

function FormMetaCard({
  icon: Icon,
  label,
  value,
  helper,
  tone = 'default',
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  helper?: string
  tone?: 'default' | 'highlight'
}) {
  const containerClass =
    tone === 'highlight'
      ? 'rounded-[24px] border border-primary/15 bg-primary/5 px-4 py-4 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-primary/[0.07] hover:shadow-md'
      : 'rounded-[24px] border border-border/60 bg-background/75 px-4 py-4 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-background hover:shadow-md'

  const iconWrapClass =
    tone === 'highlight'
      ? 'bg-primary/10 text-primary'
      : 'bg-background text-muted-foreground'

  const labelClass = tone === 'highlight' ? 'text-primary/80' : 'text-muted-foreground'
  const valueClass = tone === 'highlight' ? 'text-primary' : 'text-foreground'

  return (
    <div className={containerClass}>
      <div className="flex items-center gap-2">
        <div className={`flex size-10 items-center justify-center rounded-2xl ${iconWrapClass}`}>
          <Icon className="size-4.5" />
        </div>
        <span className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${labelClass}`}>
          {label}
        </span>
      </div>

      <p className={`mt-3 text-sm font-semibold leading-6 ${valueClass}`}>{value}</p>

      {helper ? (
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{helper}</p>
      ) : null}
    </div>
  )
}

function SectionCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-[28px] border border-border/60 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
      <div className="mb-5 space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {eyebrow}
        </p>
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        {description ? (
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        ) : null}
      </div>

      {children}
    </section>
  )
}

function EstadoConfigCard({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  disabled: boolean
}) {
  const estadoLabel =
    estadoOptions.find((option) => String(option.value) === value)?.label ?? 'Activo'

  const tone =
    value === '1'
      ? 'border-emerald-500/15 bg-emerald-500/[0.06]'
      : value === '2'
        ? 'border-amber-500/15 bg-amber-500/[0.06]'
        : 'border-rose-500/15 bg-rose-500/[0.06]'

  return (
   <div className={`rounded-[24px] border p-4 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)] ${tone} h-fit`}>
      <div className="mb-4 flex items-start gap-3">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-background/80 text-muted-foreground shadow-sm">
          <Settings2 className="size-4.5" />
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Estado del curso
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">{estadoLabel}</p>
        </div>
      </div>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="flex h-11 w-full rounded-2xl border border-border/70 bg-background/90 px-4 py-2 text-sm shadow-none transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/15"
      >
        {estadoOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function ScheduleCard({
  index,
  horario,
  onChange,
  onRemove,
  disabled,
  canRemove,
}: {
  index: number
  horario: CursoHorario
  onChange: (field: keyof CursoHorario, value: string | number) => void
  onRemove: () => void
  disabled: boolean
  canRemove: boolean
}) {
  return (
    <div className="rounded-[24px] border border-border/60 bg-background/75 p-4 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Clock3 className="size-4.5" />
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">
              Horario {index + 1}
            </p>
            <p className="text-xs text-muted-foreground">
              Definí día y rango horario del curso.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          disabled={disabled || !canRemove}
          className="h-10 w-10 rounded-2xl text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-[1.2fr_1fr_1fr]">
        <select
          value={horario.dia}
          onChange={(e) => onChange('dia', Number(e.target.value))}
          className="flex h-11 rounded-2xl border border-border/70 bg-card px-3 py-2 text-sm shadow-none transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/15"
          disabled={disabled}
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
          onChange={(e) => onChange('horaInicio', e.target.value)}
          disabled={disabled}
          className="h-11 rounded-2xl border-border/70 bg-card shadow-none transition-all duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
        />

        <Input
          type="time"
          value={horario.horaFin}
          onChange={(e) => onChange('horaFin', e.target.value)}
          disabled={disabled}
          className="h-11 rounded-2xl border-border/70 bg-card shadow-none transition-all duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
        />
      </div>
    </div>
  )
}

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
  const [success, setSuccess] = useState<string | null>(null)

  const currentStatusLabel =
    estadoOptions.find((option) => String(option.value) === form.estado)?.label ?? 'Activo'

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
    setSuccess(null)
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
      setSuccess(isEdit ? 'Curso actualizado correctamente.' : 'Curso creado correctamente.')
    } catch (err: any) {
      setError(err?.message || 'No se pudo guardar el curso.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <FormMetaCard
          icon={BookOpen}
          label="Curso"
          value={form.nombre.trim() || 'Curso sin nombre'}
          helper="Identidad principal del registro."
          tone="highlight"
        />

        <FormMetaCard
          icon={Sparkles}
          label="Modo"
          value={isEdit ? 'Edición de curso' : 'Alta de curso'}
          helper={
            isEdit
              ? 'Actualización de datos existentes.'
              : 'Creación de un nuevo curso.'
          }
        />

        <FormMetaCard
          icon={CalendarClock}
          label="Horarios"
          value={`${form.horarios.length} configurado${form.horarios.length === 1 ? '' : 's'}`}
          helper={`Estado actual: ${currentStatusLabel}.`}
        />
      </div>

    <SectionCard
  eyebrow="Identidad"
  title="Datos generales"
  description="Definí la información principal del curso y su estado operativo."
>
  <div className="space-y-5">
    <FieldGroup className="grid gap-5 md:grid-cols-2">
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

      <Field className="md:col-span-2">
        <FieldLabel htmlFor="descripcion" className="mb-2.5 text-sm font-semibold text-foreground">
          Descripción
        </FieldLabel>
        <div className="relative">
          <AlignLeft className="pointer-events-none absolute left-4 top-4 size-4 text-muted-foreground" />
          <textarea
            id="descripcion"
            value={form.descripcion}
            onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))}
            placeholder="Descripción del curso"
            disabled={isLoading}
            rows={4}
            className="w-full rounded-2xl border border-border/80 bg-background/90 py-3 pl-11 pr-4 text-[15px] shadow-none placeholder:text-muted-foreground/80 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/15"
          />
        </div>
      </Field>
    </FieldGroup>

    <div className="max-w-md">
      <EstadoConfigCard
        value={form.estado}
        onChange={(value) => setForm((prev) => ({ ...prev, estado: value }))}
        disabled={isLoading}
      />
    </div>
  </div>
</SectionCard>

      <SectionCard
        eyebrow="Horarios"
        title="Configuración horaria"
        description="Definí uno o varios bloques horarios para el curso."
      >
        <div className="space-y-4">
          <div className="flex">
  <Button
    type="button"
    variant="outline"
    size="sm"
    onClick={addHorario}
    className="h-10 rounded-2xl border-border/70 bg-background/75 px-4 text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-primary/8 hover:text-primary"
  >
    <Plus className="mr-2 size-4" />
    Agregar horario
  </Button>
</div>

          <div className="space-y-3">
            {form.horarios.map((horario, index) => (
              <ScheduleCard
                key={index}
                index={index}
                horario={horario}
                onChange={(field, value) => handleHorarioChange(index, field, value)}
                onRemove={() => removeHorario(index)}
                disabled={isLoading}
                canRemove={form.horarios.length > 1}
              />
            ))}
          </div>
        </div>
      </SectionCard>

      {error && (
        <Alert className="rounded-2xl border-destructive/25 bg-destructive/5 text-destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
          <div className="flex items-center gap-2">
            <BadgeCheck className="size-4" />
            {success}
          </div>
        </div>
      )}

      <div className="sticky bottom-4 z-10 flex justify-end">
        <div className="rounded-[24px] border border-border/60 bg-card/90 p-2 shadow-[0_18px_40px_-22px_rgba(15,23,42,0.22)] backdrop-blur-xl">
          <Button
            type="submit"
            className="min-w-44 rounded-2xl bg-primary px-5 text-[15px] font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg active:translate-y-0 active:shadow-md"
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
      </div>
    </form>
  )
}