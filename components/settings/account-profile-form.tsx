'use client'

import { useEffect, useState } from 'react'
import { BadgeCheck, Loader2, Save, UserRound } from 'lucide-react'

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
    <Card className="rounded-[28px] border border-border/70 bg-card/95 shadow-[0_18px_44px_-24px_rgba(30,42,68,0.18)]">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <UserRound className="size-5" />
          </div>

          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold tracking-tight">
              Perfil
            </CardTitle>
            <CardDescription>
              Actualizá la información principal de tu cuenta.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nombre</label>
              <Input
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                placeholder="Nombre"
                className="h-11 rounded-2xl border-border/70 bg-card/80 shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Apellido</label>
              <Input
                value={formData.apellido}
                onChange={(e) => handleChange('apellido', e.target.value)}
                placeholder="Apellido"
                className="h-11 rounded-2xl border-border/70 bg-card/80 shadow-sm"
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
                className="h-11 rounded-2xl border-border/70 bg-card/80 shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Teléfono</label>
              <Input
                value={formData.telefono ?? ''}
                onChange={(e) => handleChange('telefono', e.target.value)}
                placeholder="341..."
                className="h-11 rounded-2xl border-border/70 bg-card/80 shadow-sm"
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
                className="h-11 rounded-2xl border-border/70 bg-card/80 shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Roles</label>
              <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-2xl border border-border/70 bg-muted/15 px-3 py-2">
                {account.roles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                  >
                    <BadgeCheck className="size-3.5" />
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-3 text-sm text-green-700 dark:text-green-400">
              {success}
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 rounded-2xl bg-primary/90 px-5 text-primary-foreground shadow-[0_14px_30px_-18px_rgba(36,59,123,0.42)] transition-all hover:-translate-y-[1px] hover:bg-primary hover:shadow-[0_18px_36px_-18px_rgba(36,59,123,0.50)]"
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