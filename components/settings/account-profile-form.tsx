'use client'

import { useEffect, useState } from 'react'
import { Loader2, Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { updateMyAccountSettings } from '@/lib/settings/api'
import type { MyAccountSettings, UpdateMyAccountSettingsDTO } from '@/lib/settings/types'

export function AccountProfileForm({
  account,
  onUpdated,
}: {
  account: MyAccountSettings
  onUpdated: (value: MyAccountSettings) => void
}) {
  const [formData, setFormData] = useState<UpdateMyAccountSettingsDTO>({
    nombre: account.nombre,
    apellido: account.apellido,
    email: account.email,
    telefono: account.telefono ?? '',
    dni: account.dni,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    setFormData({
      nombre: account.nombre,
      apellido: account.apellido,
      email: account.email,
      telefono: account.telefono ?? '',
      dni: account.dni,
    })
  }, [account])

  const handleChange = (
    field: keyof UpdateMyAccountSettingsDTO,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'dni' ? Number(value) || 0 : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      const updated = await updateMyAccountSettings({
        ...formData,
        telefono: formData.telefono?.trim() ? formData.telefono : null,
      })

      onUpdated(updated)
      setSuccess('Los datos de la cuenta fueron actualizados correctamente.')
    } catch (err: any) {
      setError(err?.message || 'No se pudo actualizar la información.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-border/70 bg-card/95 shadow-[0_18px_40px_-22px_rgba(30,42,68,0.20)]">
      <CardHeader className="space-y-2">
        <CardTitle className="text-lg font-semibold tracking-tight">
          Perfil
        </CardTitle>
        <CardDescription>
          Actualizá la información de tu cuenta.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nombre</label>
              <Input
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                placeholder="Nombre"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Apellido</label>
              <Input
                value={formData.apellido}
                onChange={(e) => handleChange('apellido', e.target.value)}
                placeholder="Apellido"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@ejemplo.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Teléfono</label>
              <Input
                value={formData.telefono ?? ''}
                onChange={(e) => handleChange('telefono', e.target.value)}
                placeholder="341..."
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[220px_1fr]">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">DNI</label>
              <Input
                type="number"
                value={formData.dni || ''}
                onChange={(e) => handleChange('dni', e.target.value)}
                placeholder="DNI"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Roles</label>
              <div className="flex min-h-10 flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-muted/20 px-3 py-2">
                {account.roles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-success/20 bg-success/5 p-3 text-sm text-success">
              {success}
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 rounded-xl bg-primary/90 text-primary-foreground shadow-sm transition-all hover:bg-primary hover:shadow-md hover:-translate-y-[1px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 size-4" />
                  Guardar cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}