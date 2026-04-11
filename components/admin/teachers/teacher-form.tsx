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
  Sparkles,
  KeyRound,
  BadgeCheck,
  GraduationCap,
} from 'lucide-react'

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
  children,
}: {
  eyebrow: string
  title: string
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
    return `${form.nombre} ${form.apellido}`.trim() || 'Profesor'
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
        setSuccess('Profesor actualizado correctamente.')
      } else {
        if (!form.password.trim()) {
          throw new Error('La contraseña es obligatoria.')
        }

        const payload: CreateProfesorDTO = {
          ...basePayload,
          password: form.password.trim(),
        }

        await onSubmit(payload)
        setSuccess('Profesor creado correctamente.')
      }
    } catch (err: any) {
      setError(err?.message || 'No se pudo guardar el profesor.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <FormMetaCard
          icon={GraduationCap}
          label="Profesor"
          value={fullName}
          helper="Identidad principal del registro."
          tone="highlight"
        />

        <FormMetaCard
          icon={Sparkles}
          label="Modo"
          value={isEdit ? 'Edición de profesor' : 'Alta de profesor'}
          helper={
            isEdit
              ? 'Actualización de datos existentes.'
              : 'Creación de una nueva cuenta.'
          }
        />

        <FormMetaCard
          icon={KeyRound}
          label="Acceso"
          value={isEdit ? 'Contraseña opcional' : 'Contraseña obligatoria'}
          helper={
            isEdit
              ? 'Solo se actualiza si ingresás una nueva.'
              : 'Se utilizará para el primer acceso.'
          }
        />
      </div>

      <SectionCard eyebrow="Identidad" title="Datos personales">
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
                className="h-12 rounded-2xl border-border/80 bg-background/90 pl-11 pr-4 text-[15px] shadow-none placeholder:text-muted-foreground/80 transition-all duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
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
                className="h-12 rounded-2xl border-border/80 bg-background/90 pl-11 pr-4 text-[15px] shadow-none placeholder:text-muted-foreground/80 transition-all duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
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
                className="h-12 rounded-2xl border-border/80 bg-background/90 pl-11 pr-4 text-[15px] shadow-none placeholder:text-muted-foreground/80 transition-all duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
                required
                disabled={isLoading}
              />
            </div>
          </Field>
        </FieldGroup>
      </SectionCard>

      <SectionCard eyebrow="Contacto" title="Datos de contacto">
        <FieldGroup className="grid gap-5 md:grid-cols-2">
          <Field>
            <FieldLabel
              htmlFor="email"
              className="mb-2.5 text-sm font-semibold text-foreground"
            >
              Email
            </FieldLabel>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="profesor@email.com"
                className="h-12 rounded-2xl border-border/80 bg-background/90 pl-11 pr-4 text-[15px] shadow-none placeholder:text-muted-foreground/80 transition-all duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
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
                className="h-12 rounded-2xl border-border/80 bg-background/90 pl-11 pr-4 text-[15px] shadow-none placeholder:text-muted-foreground/80 transition-all duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
                disabled={isLoading}
              />
            </div>
          </Field>
        </FieldGroup>
      </SectionCard>

      <SectionCard eyebrow="Acceso" title="Credenciales">
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
                className="h-12 rounded-2xl border-border/80 bg-background/90 pl-11 pr-12 text-[15px] shadow-none placeholder:text-muted-foreground/80 transition-all duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
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
                : 'Definí una contraseña inicial para el acceso del profesor a la plataforma.'}
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
            'Crear profesor'
          )}
        </Button>
      </div>
    </form>
  )
}