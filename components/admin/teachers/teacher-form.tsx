'use client'

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
  KeyRound,
  BadgeCheck,
  GraduationCap,
} from 'lucide-react'

import { UserAvatar } from '@/components/shared/user-avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import type {
  Profesor,
  CreateProfesorDTO,
  UpdateProfesorDTO,
} from '@/lib/admin/teachers/types'

interface TeacherFormProps {
  mode: 'create' | 'edit'
  initialData?: Profesor
  onSubmit: (payload: CreateProfesorDTO | UpdateProfesorDTO) => Promise<void>
}

function TeacherIdentityPanel({
  fullName,
  email,
  isEdit,
}: {
  fullName: string
  email: string
  isEdit: boolean
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <UserAvatar
            name={fullName}
            avatarUrl={null}
            size={48}
            className="shrink-0"
            fallbackClassName="bg-primary/10 text-primary"
          />
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-foreground">{fullName}</h2>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {email || 'Correo institucional pendiente'}
            </p>
          </div>
        </div>

        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="rounded-xl border border-border/60 bg-background/60 px-3 py-2 dark:bg-background/25">
            <div className="flex items-center gap-2 text-muted-foreground">
              <GraduationCap className="size-4" />
              <span>Registro</span>
            </div>
            <p className="mt-1 font-medium text-foreground">
              {isEdit ? 'Edición de docente' : 'Alta de docente'}
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-background/60 px-3 py-2 dark:bg-background/25">
            <div className="flex items-center gap-2 text-muted-foreground">
              <KeyRound className="size-4" />
              <span>Acceso</span>
            </div>
            <p className="mt-1 font-medium text-foreground">
              {isEdit ? 'Contraseña opcional' : 'Contraseña obligatoria'}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-sm sm:p-5">
      <div className="mb-5 space-y-1">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="text-sm leading-5 text-muted-foreground">{description}</p>
      </div>

      {children}
    </section>
  )
}

export function TeacherForm({ mode, initialData, onSubmit }: TeacherFormProps) {
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
    return `${form.nombre} ${form.apellido}`.trim() || 'Nuevo docente'
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
        const payload: UpdateProfesorDTO = {
          ...basePayload,
          ...(form.password.trim() ? { password: form.password.trim() } : {}),
        }

        await onSubmit(payload)
        setSuccess('Docente actualizado correctamente.')
      } else {
        if (!form.password.trim()) {
          throw new Error('La contraseña es obligatoria.')
        }

        const payload: CreateProfesorDTO = {
          ...basePayload,
          password: form.password.trim(),
        }

        await onSubmit(payload)
        setSuccess('Docente creado correctamente.')
      }
    } catch (err: any) {
      setError(err?.message || 'No se pudo guardar el docente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <TeacherIdentityPanel fullName={fullName} email={form.email} isEdit={isEdit} />

      <SectionCard
        title="Datos personales"
        description="Identificación básica del docente dentro del equipo académico."
      >
        <FieldGroup className="grid gap-5 md:grid-cols-2">
          <Field>
            <FieldLabel
              htmlFor="nombre"
              className="mb-2.5 text-sm font-semibold text-foreground"
            >
              Nombre
            </FieldLabel>
            <div className="relative">
              <User className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="nombre"
                value={form.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                placeholder="Nombre"
                className="h-11 rounded-xl border-border/70 bg-background/80 pl-11 pr-4 text-[15px] shadow-none placeholder:text-muted-foreground/70 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35"
                required
                disabled={isLoading}
              />
            </div>
          </Field>

          <Field>
            <FieldLabel
              htmlFor="apellido"
              className="mb-2.5 text-sm font-semibold text-foreground"
            >
              Apellido
            </FieldLabel>
            <div className="relative">
              <User className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="apellido"
                value={form.apellido}
                onChange={(e) => handleChange('apellido', e.target.value)}
                placeholder="Apellido"
                className="h-11 rounded-xl border-border/70 bg-background/80 pl-11 pr-4 text-[15px] shadow-none placeholder:text-muted-foreground/70 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35"
                required
                disabled={isLoading}
              />
            </div>
          </Field>

          <Field className="md:col-span-2">
            <FieldLabel
              htmlFor="dni"
              className="mb-2.5 text-sm font-semibold text-foreground"
            >
              DNI
            </FieldLabel>
            <div className="relative max-w-sm">
              <ShieldCheck className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="dni"
                value={form.dni}
                onChange={(e) => handleChange('dni', e.target.value)}
                placeholder="12345678"
                className="h-11 rounded-xl border-border/70 bg-background/80 pl-11 pr-4 text-[15px] shadow-none placeholder:text-muted-foreground/70 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35"
                required
                disabled={isLoading}
              />
            </div>
          </Field>
        </FieldGroup>
      </SectionCard>

      <SectionCard
        title="Datos de contacto"
        description="Canales institucionales para coordinación académica."
      >
        <FieldGroup className="grid gap-5 md:grid-cols-2">
          <Field>
            <FieldLabel
              htmlFor="email"
              className="mb-2.5 text-sm font-semibold text-foreground"
            >
              Correo electrónico
            </FieldLabel>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="docente@correo.com"
                className="h-11 rounded-xl border-border/70 bg-background/80 pl-11 pr-4 text-[15px] shadow-none placeholder:text-muted-foreground/70 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35"
                required
                disabled={isLoading}
              />
            </div>
          </Field>

          <Field>
            <FieldLabel
              htmlFor="telefono"
              className="mb-2.5 text-sm font-semibold text-foreground"
            >
              Teléfono
            </FieldLabel>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="telefono"
                value={form.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                placeholder="341..."
                className="h-11 rounded-xl border-border/70 bg-background/80 pl-11 pr-4 text-[15px] shadow-none placeholder:text-muted-foreground/70 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35"
                disabled={isLoading}
              />
            </div>
          </Field>
        </FieldGroup>
      </SectionCard>

      <SectionCard
        title="Credenciales"
        description="Acceso de la cuenta docente. La contraseña solo se actualiza si corresponde."
      >
        <FieldGroup className="space-y-5">
          <Field>
            <FieldLabel
              htmlFor="password"
              className="mb-2.5 text-sm font-semibold text-foreground"
            >
              {isEdit ? 'Nueva contraseña (opcional)' : 'Contraseña'}
            </FieldLabel>

            <div className="relative max-w-xl">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder={isEdit ? 'Solo si querés cambiarla' : 'Ingresá una contraseña'}
                className="h-11 rounded-xl border-border/70 bg-background/80 pl-11 pr-12 text-[15px] shadow-none placeholder:text-muted-foreground/70 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35"
                required={!isEdit}
                disabled={isLoading}
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1.5 top-1.5 h-9 w-9 rounded-xl text-muted-foreground transition-all duration-200 hover:bg-primary/8 hover:text-primary"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              {isEdit
                ? 'Dejá este campo vacío si no querés modificar la contraseña actual.'
                : 'Definí una contraseña inicial para el acceso del docente a la plataforma.'}
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

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          className="min-w-44 rounded-xl bg-primary px-5 text-[15px] font-semibold text-primary-foreground shadow-none transition-colors duration-200 hover:bg-primary/90 active:scale-[0.98]"
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
            'Crear docente'
          )}
        </Button>
      </div>
    </form>
  )
}
