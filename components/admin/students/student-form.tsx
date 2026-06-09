'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Phone,
  User,
  ShieldCheck,
  LockKeyhole,
  BadgeCheck,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import type {
  Alumno,
  CreateAlumnoDTO,
  UpdateAlumnoDTO,
} from '@/lib/admin/students/types'

interface StudentFormProps {
  mode: 'create' | 'edit'
  initialData?: Alumno
  onSubmit: (payload: CreateAlumnoDTO | UpdateAlumnoDTO) => Promise<void>
  cancelHref: string
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-sm sm:p-5">
      <div className="mb-4 space-y-1">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        {description ? (
          <p className="text-sm leading-5 text-muted-foreground">{description}</p>
        ) : null}
      </div>

      {children}
    </section>
  )
}

export function StudentForm({ mode, initialData, onSubmit, cancelHref }: StudentFormProps) {
  const isEdit = mode === 'edit'

  const [form, setForm] = useState({
    nombre: initialData?.nombre ?? '',
    apellido: initialData?.apellido ?? '',
    dni: initialData?.dni ? String(initialData.dni) : '',
    telefono: initialData?.telefono ?? '',
    email: initialData?.email ?? '',
    password: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const fullName = useMemo(() => {
    return `${form.nombre} ${form.apellido}`.trim() || 'Alumno'
  }, [form.nombre, form.apellido])

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    try {
      const basePayload = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        dni: Number(form.dni),
        telefono: form.telefono.trim(),
        email: form.email.trim(),
      }

      if (!basePayload.nombre || !basePayload.apellido || !basePayload.email || !basePayload.dni) {
        throw new Error('Completá los campos obligatorios.')
      }

      if (Number.isNaN(basePayload.dni)) {
        throw new Error('El DNI debe ser numérico.')
      }

      if (isEdit) {
        const payload: UpdateAlumnoDTO = {
          ...basePayload,
          ...(form.password.trim() ? { password: form.password.trim() } : {}),
        }

        await onSubmit(payload)
        setSuccess('Alumno actualizado correctamente.')
      } else {
        if (!form.password.trim()) {
          throw new Error('La contraseña es obligatoria.')
        }

        const payload: CreateAlumnoDTO = {
          ...basePayload,
          password: form.password.trim(),
        }

        await onSubmit(payload)
        setSuccess('Alumno creado correctamente.')
      }
    } catch (err: any) {
      setError(err?.message || 'No se pudo guardar el alumno.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-2xl border border-border/60 bg-card/95 px-4 py-3 text-sm text-muted-foreground shadow-sm">
        <span className="font-medium text-foreground">{fullName}</span>
        <span className="mx-2 text-border">|</span>
        Los campos marcados con * son obligatorios.
      </div>

      <SectionCard
        title="Datos personales"
        description="Identificación básica del alumno para el registro institucional."
      >
        <FieldGroup className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel
              htmlFor="nombre"
              className="mb-2 text-sm font-semibold text-foreground"
            >
              Nombre *
            </FieldLabel>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="nombre"
                value={form.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                placeholder="Nombre"
                className="h-10 rounded-xl border-border/70 bg-background/75 pl-10 pr-3 text-sm shadow-none placeholder:text-muted-foreground/75 focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35"
                required
                disabled={isLoading}
              />
            </div>
          </Field>

          <Field>
            <FieldLabel
              htmlFor="apellido"
              className="mb-2 text-sm font-semibold text-foreground"
            >
              Apellido *
            </FieldLabel>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="apellido"
                value={form.apellido}
                onChange={(e) => handleChange('apellido', e.target.value)}
                placeholder="Apellido"
                className="h-10 rounded-xl border-border/70 bg-background/75 pl-10 pr-3 text-sm shadow-none placeholder:text-muted-foreground/75 focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35"
                required
                disabled={isLoading}
              />
            </div>
          </Field>

          <Field className="md:col-span-2">
            <FieldLabel
              htmlFor="dni"
              className="mb-2 text-sm font-semibold text-foreground"
            >
              DNI *
            </FieldLabel>
            <div className="relative max-w-sm">
              <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="dni"
                value={form.dni}
                onChange={(e) => handleChange('dni', e.target.value)}
                placeholder="12345678"
                className="h-10 rounded-xl border-border/70 bg-background/75 pl-10 pr-3 text-sm shadow-none placeholder:text-muted-foreground/75 focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35"
                required
                disabled={isLoading}
              />
            </div>
          </Field>
        </FieldGroup>
      </SectionCard>

      <SectionCard title="Datos de contacto">
        <FieldGroup className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel
              htmlFor="email"
              className="mb-2 text-sm font-semibold text-foreground"
            >
              Email *
            </FieldLabel>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="alumno@email.com"
                className="h-10 rounded-xl border-border/70 bg-background/75 pl-10 pr-3 text-sm shadow-none placeholder:text-muted-foreground/75 focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35"
                required
                disabled={isLoading}
              />
            </div>
          </Field>

          <Field>
            <FieldLabel
              htmlFor="telefono"
              className="mb-2 text-sm font-semibold text-foreground"
            >
              Teléfono
            </FieldLabel>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="telefono"
                value={form.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                placeholder="341..."
                className="h-10 rounded-xl border-border/70 bg-background/75 pl-10 pr-3 text-sm shadow-none placeholder:text-muted-foreground/75 focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35"
                disabled={isLoading}
              />
            </div>
          </Field>
        </FieldGroup>
      </SectionCard>

      <SectionCard
        title="Credenciales"
        description={isEdit ? 'La contraseña se modifica solo si completás este campo.' : 'Definí el acceso inicial del alumno.'}
      >
        <FieldGroup className="space-y-4">
          <Field>
            <FieldLabel
              htmlFor="password"
              className="mb-2 text-sm font-semibold text-foreground"
            >
              {isEdit ? 'Nueva contraseña' : 'Contraseña *'}
            </FieldLabel>

            <div className="relative max-w-xl">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder={isEdit ? 'Solo si querés cambiarla' : 'Ingresá una contraseña'}
                className="h-10 rounded-xl border-border/70 bg-background/75 pl-10 pr-12 text-sm shadow-none placeholder:text-muted-foreground/75 focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35"
                required={!isEdit}
                disabled={isLoading}
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0.5 top-0.5 h-9 w-9 rounded-xl text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary active:scale-[0.98]"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              {isEdit
                ? 'Dejá este campo vacío si no querés modificar la contraseña actual.'
                : 'Definí una contraseña inicial para el acceso del alumno a la plataforma.'}
            </p>
          </Field>
        </FieldGroup>
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

      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
        <Button
          asChild
          variant="outline"
          className="h-10 rounded-xl border-border/70 bg-background/70 px-4 shadow-none active:scale-[0.98]"
        >
          <Link href={cancelHref}>Cancelar</Link>
        </Button>
        <Button
          type="submit"
          className="h-10 min-w-40 rounded-xl px-4 text-sm font-semibold shadow-none active:scale-[0.98]"
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
            'Crear alumno'
          )}
        </Button>
      </div>
    </form>
  )
}
