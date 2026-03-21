'use client'

import { useMemo, useState } from 'react'
import { Eye, EyeOff, Loader2, Mail, Phone, User, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import type { Alumno, CreateAlumnoDTO, UpdateAlumnoDTO } from '@/lib/students/types'

interface StudentFormProps {
  mode: 'create' | 'edit'
  initialData?: Alumno
  onSubmit: (payload: CreateAlumnoDTO | UpdateAlumnoDTO) => Promise<void>
}

export function StudentForm({ mode, initialData, onSubmit }: StudentFormProps) {
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
    () => (isEdit ? 'Editar alumno' : 'Nuevo alumno'),
    [isEdit]
  )

  const description = useMemo(
    () =>
      isEdit
        ? 'Actualizá la información principal del alumno.'
        : 'Completá los datos para registrar un nuevo alumno.',
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
        const payload: UpdateAlumnoDTO = {
          ...basePayload,
          ...(form.password.trim() ? { password: form.password.trim() } : {}),
        }

        await onSubmit(payload)
      } else {
        if (!form.password.trim()) {
          throw new Error('La contraseña es obligatoria.')
        }

        const payload: CreateAlumnoDTO = {
          ...basePayload,
          password: form.password.trim(),
        }

        await onSubmit(payload)
      }
    } catch (err: any) {
      setError(err?.message || 'No se pudo guardar el alumno.')
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
          <FieldGroup className="space-y-5">
            {error && (
              <Alert variant="destructive" className="border-destructive/20">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="nombre">Nombre</FieldLabel>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="nombre"
                    value={form.nombre}
                    onChange={(e) => handleChange('nombre', e.target.value)}
                    placeholder="Nombre"
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="apellido">Apellido</FieldLabel>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="apellido"
                    value={form.apellido}
                    onChange={(e) => handleChange('apellido', e.target.value)}
                    placeholder="Apellido"
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="dni">DNI</FieldLabel>
                <div className="relative">
                  <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="dni"
                    value={form.dni}
                    onChange={(e) => handleChange('dni', e.target.value)}
                    placeholder="12345678"
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="telefono">Teléfono</FieldLabel>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="telefono"
                    value={form.telefono}
                    onChange={(e) => handleChange('telefono', e.target.value)}
                    placeholder="341..."
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="alumno@email.com"
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="password">
                {isEdit ? 'Nueva contraseña (opcional)' : 'Contraseña'}
              </FieldLabel>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder={isEdit ? 'Solo si querés cambiarla' : 'Ingresá una contraseña'}
                  className="pr-11"
                  required={!isEdit}
                  disabled={isLoading}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-8 w-8 text-muted-foreground"
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
                className="min-w-40"
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
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}