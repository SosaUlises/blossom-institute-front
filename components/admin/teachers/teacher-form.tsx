'use client'

import { useMemo, useState } from 'react'
import { Eye, EyeOff, Loader2, Mail, Phone, User, ShieldCheck, LockKeyhole } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import type { Profesor, CreateProfesorDTO, UpdateProfesorDTO } from '@/lib/admin/teachers/types'

interface TeacherFormProps {
  mode: 'create' | 'edit'
  initialData?: Profesor
  onSubmit: (payload: CreateProfesorDTO | UpdateProfesorDTO) => Promise<void>
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
  const [showPassword, setShowPassword] = useState(false)

  const title = useMemo(
    () => (isEdit ? 'Actualizar profesor' : 'Crear profesor'),
    [isEdit]
  )

  const description = useMemo(
    () =>
      isEdit
        ? 'Modificá la información del profesor y actualizá sus datos principales.'
        : 'Ingresá los datos principales del profesor para crear su cuenta en la plataforma.',
    [isEdit]
  )

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
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
      } else {
        if (!form.password.trim()) {
          throw new Error('La contraseña es obligatoria.')
        }

        const payload: CreateProfesorDTO = {
          ...basePayload,
          password: form.password.trim(),
        }

        await onSubmit(payload)
      }
    } catch (err: any) {
      setError(err?.message || 'No se pudo guardar el profesor.')
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
          <FieldGroup className="space-y-6">
            {error && (
              <Alert className="rounded-2xl border-destructive/25 bg-destructive/5 text-destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-5 md:grid-cols-2">
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
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field>
                <FieldLabel
                  htmlFor="dni"
                  className="mb-2.5 text-sm font-semibold text-foreground"
                >
                  DNI
                </FieldLabel>
                <div className="relative">
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
            </div>

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
                htmlFor="password"
                className="mb-2.5 text-sm font-semibold text-foreground"
              >
                {isEdit ? 'Nueva contraseña (opcional)' : 'Contraseña'}
              </FieldLabel>

              <div className="relative">
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
            </Field>

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
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}