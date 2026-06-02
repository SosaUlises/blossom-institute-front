'use client'

import type { ComponentType, FormEvent, ReactNode } from 'react'
import { useState } from 'react'
import {
  AlignLeft,
  BadgeCheck,
  BookOpen,
  CalendarClock,
  CalendarRange,
  Clock3,
  Loader2,
  Plus,
  Settings2,
  Trash2,
} from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type {
  CreateCursoDTO,
  CursoById,
  CursoHorario,
  UpdateCursoDTO,
} from '@/lib/admin/courses/types'
import { cn } from '@/lib/utils'

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

function SummaryTile({
  icon: Icon,
  label,
  value,
  detail,
  tone = 'neutral',
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
  detail: string
  tone?: 'neutral' | 'primary'
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border bg-card/95 p-4 shadow-sm dark:bg-card/80',
        tone === 'primary' ? 'border-primary/20 bg-primary/5' : 'border-border/60',
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-xl ring-1',
            tone === 'primary'
              ? 'bg-primary/10 text-primary ring-primary/15'
              : 'bg-background/70 text-muted-foreground ring-border/50 dark:bg-background/25',
          )}
        >
          <Icon className="size-4.5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 truncate text-sm font-semibold text-foreground">{value}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
        </div>
      </div>
    </div>
  )
}

function SectionPanel({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-sm dark:bg-card/80 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background/70 text-muted-foreground ring-1 ring-border/50 dark:bg-background/25">
          <Icon className="size-4.5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="mt-5">{children}</div>
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

  return (
    <div className="rounded-2xl border border-border/60 bg-background/60 p-4 dark:bg-background/25">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-card/85 text-muted-foreground ring-1 ring-border/50">
          <Settings2 className="size-4.5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">Condición del curso</p>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            Estado visible: {estadoLabel}
          </p>
        </div>
      </div>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="flex h-11 w-full rounded-xl border border-border/70 bg-card px-3 py-2 text-sm shadow-none transition-[border-color,box-shadow] duration-200 focus:outline-none focus:ring-4 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
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
  const removeButton = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={disabled || !canRemove}
      aria-label={`Quitar horario ${index + 1}`}
      className="size-9 rounded-xl text-muted-foreground transition-[background-color,color,transform] duration-200 hover:bg-destructive/10 hover:text-destructive active:scale-[0.98]"
      onClick={canRemove ? undefined : onRemove}
    >
      <Trash2 className="size-4" />
    </Button>
  )

  return (
    <div className="rounded-2xl border border-border/60 bg-background/60 p-4 dark:bg-background/25">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <Clock3 className="size-4.5" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Horario {index + 1}</p>
            <p className="text-sm leading-5 text-muted-foreground">
              Día y rango usados para agenda y asistencia.
            </p>
          </div>
        </div>

        {canRemove ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>{removeButton}</AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Quitar horario</AlertDialogTitle>
                <AlertDialogDescription>
                  Este bloque se quitará del curso cuando guardes los cambios. La agenda y la
                  asistencia tomarán la nueva configuración.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onRemove}>Quitar horario</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          removeButton
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-[1.2fr_1fr_1fr]">
        <select
          value={horario.dia}
          onChange={(event) => onChange('dia', Number(event.target.value))}
          className="flex h-11 rounded-xl border border-border/70 bg-card px-3 py-2 text-sm shadow-none transition-[border-color,box-shadow] duration-200 focus:outline-none focus:ring-4 focus:ring-primary/15"
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
          onChange={(event) => onChange('horaInicio', event.target.value)}
          disabled={disabled}
          className="h-11 rounded-xl border-border/70 bg-card shadow-none transition-[border-color,box-shadow] duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
        />

        <Input
          type="time"
          value={horario.horaFin}
          onChange={(event) => onChange('horaFin', event.target.value)}
          disabled={disabled}
          className="h-11 rounded-xl border-border/70 bg-card shadow-none transition-[border-color,box-shadow] duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
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
        ? initialData.horarios.map((horario) => ({
            dia: horario.dia,
            horaInicio: horario.horaInicio,
            horaFin: horario.horaFin,
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
    value: string | number,
  ) => {
    setForm((previous) => {
      const updated = [...previous.horarios]
      updated[index] = {
        ...updated[index],
        [field]: value,
      }

      return { ...previous, horarios: updated }
    })
  }

  const addHorario = () => {
    setForm((previous) => ({
      ...previous,
      horarios: [...previous.horarios, { dia: 1, horaInicio: '18:00', horaFin: '19:00' }],
    }))
  }

  const removeHorario = (index: number) => {
    setForm((previous) => ({
      ...previous,
      horarios: previous.horarios.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    try {
      const anio = Number(form.anio)
      const estado = Number(form.estado)

      if (!form.nombre.trim()) throw new Error('El nombre es obligatorio.')
      if (Number.isNaN(anio)) throw new Error('El año debe ser numérico.')
      if (!form.horarios.length) throw new Error('Agregá al menos un horario.')

      const horarios = form.horarios.map((horario) => ({
        dia: Number(horario.dia),
        horaInicio: horario.horaInicio,
        horaFin: horario.horaFin,
      }))

      await onSubmit({
        nombre: form.nombre.trim(),
        anio,
        descripcion: form.descripcion.trim(),
        estado,
        horarios,
      } as CreateCursoDTO | UpdateCursoDTO)

      setSuccess(isEdit ? 'Curso actualizado correctamente.' : 'Curso creado correctamente.')
    } catch (err: any) {
      setError(err?.message || 'No se pudo guardar el curso.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        <SummaryTile
          icon={BookOpen}
          label="Curso"
          value={form.nombre.trim() || 'Curso sin nombre'}
          detail="Base para asistencia, tareas y seguimiento."
          tone="primary"
        />
        <SummaryTile
          icon={CalendarRange}
          label="Ciclo"
          value={form.anio || 'Sin año definido'}
          detail="Referencia para reportes y tablero académico."
        />
        <SummaryTile
          icon={CalendarClock}
          label="Ritmo"
          value={`${form.horarios.length} horario${form.horarios.length === 1 ? '' : 's'}`}
          detail={`Condición actual: ${currentStatusLabel}.`}
        />
      </div>

      <SectionPanel
        icon={BookOpen}
        title="Identidad académica"
        description="Datos mínimos para reconocer el curso en tableros, asistencia y reportes."
      >
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
                onChange={(event) => setForm((previous) => ({ ...previous, nombre: event.target.value }))}
                placeholder="Inglés Inicial A"
                required
                disabled={isLoading}
                className="h-11 rounded-xl border-border/80 bg-background/90 pl-11 pr-4 text-[15px] shadow-none placeholder:text-muted-foreground/80 transition-[border-color,box-shadow] duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
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
                onChange={(event) => setForm((previous) => ({ ...previous, anio: event.target.value }))}
                placeholder="2026"
                required
                disabled={isLoading}
                className="h-11 rounded-xl border-border/80 bg-background/90 pl-11 pr-4 text-[15px] shadow-none placeholder:text-muted-foreground/80 transition-[border-color,box-shadow] duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
              />
            </div>
          </Field>

          <Field className="md:col-span-2">
            <FieldLabel
              htmlFor="descripcion"
              className="mb-2.5 text-sm font-semibold text-foreground"
            >
              Descripción
            </FieldLabel>
            <div className="relative">
              <AlignLeft className="pointer-events-none absolute left-4 top-4 size-4 text-muted-foreground" />
              <textarea
                id="descripcion"
                value={form.descripcion}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, descripcion: event.target.value }))
                }
                placeholder="Notas internas sobre foco, nivel o grupo de referencia"
                disabled={isLoading}
                rows={4}
                className="w-full rounded-xl border border-border/80 bg-background/90 py-3 pl-11 pr-4 text-[15px] shadow-none placeholder:text-muted-foreground/80 transition-[border-color,box-shadow] duration-200 focus:outline-none focus:ring-4 focus:ring-primary/15"
              />
            </div>
          </Field>
        </FieldGroup>
      </SectionPanel>

      <SectionPanel
        icon={Settings2}
        title="Condición operativa"
        description="Define si el curso participa del seguimiento activo o queda fuera de la lectura diaria."
      >
        <div className="max-w-md">
          <EstadoConfigCard
            value={form.estado}
            onChange={(value) => setForm((previous) => ({ ...previous, estado: value }))}
            disabled={isLoading}
          />
        </div>
      </SectionPanel>

      <SectionPanel
        icon={Clock3}
        title="Ritmo de cursada"
        description="Bloques horarios usados para agenda, asistencia y continuidad del curso."
      >
        <div className="space-y-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addHorario}
            disabled={isLoading}
            className="h-10 rounded-xl border-border/70 bg-background/75 px-4 text-foreground shadow-none transition-[transform,background-color,border-color,color] duration-200 hover:border-primary/20 hover:bg-primary/10 hover:text-primary active:scale-[0.98]"
          >
            <Plus className="mr-2 size-4" />
            Agregar horario
          </Button>

          <div className="space-y-3">
            {form.horarios.map((horario, index) => (
              <ScheduleCard
                key={`${horario.dia}-${horario.horaInicio}-${index}`}
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
      </SectionPanel>

      {error ? (
        <Alert className="rounded-2xl border-destructive/25 bg-destructive/5 text-destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {success ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
          <div className="flex items-center gap-2">
            <BadgeCheck className="size-4" />
            {success}
          </div>
        </div>
      ) : null}

      <div className="sticky bottom-4 z-10 flex justify-end">
        <div className="rounded-2xl border border-border/60 bg-card/90 p-2 shadow-sm backdrop-blur-xl dark:bg-card/80">
          <Button
            type="submit"
            className="min-w-40 rounded-xl px-5 text-[15px] font-semibold shadow-none transition-[transform,background-color] duration-200 active:scale-[0.98]"
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
