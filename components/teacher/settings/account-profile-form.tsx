'use client'

import { useEffect, useState } from 'react'
import { Loader2, Save, UserRound } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  RoleChipList,
  SettingsSection,
} from '@/components/teacher/settings/settings-ui'
import { updateMyAccountSettings } from '@/lib/teacher/settings/api'
import type {
  MyAccountSettings,
  UpdateMyAccountSettingsDTO,
} from '@/lib/teacher/settings/types'

interface AccountProfileFormProps {
  account: MyAccountSettings
  onUpdated: (updated: MyAccountSettings) => void
}

export function AccountProfileForm({
  account,
  onUpdated,
}: AccountProfileFormProps) {
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
    <SettingsSection
      icon={UserRound}
      title="Perfil"
      description="Datos personales."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nombre</label>
              <Input
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                placeholder="Nombre"
                className="h-10 rounded-xl border-border/60 bg-background/75 shadow-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Apellido</label>
              <Input
                value={formData.apellido}
                onChange={(e) => handleChange('apellido', e.target.value)}
                placeholder="Apellido"
                className="h-10 rounded-xl border-border/60 bg-background/75 shadow-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35"
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
                className="h-10 rounded-xl border-border/60 bg-background/75 shadow-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Teléfono</label>
              <Input
                value={formData.telefono ?? ''}
                onChange={(e) => handleChange('telefono', e.target.value)}
                placeholder="341..."
                className="h-10 rounded-xl border-border/60 bg-background/75 shadow-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">DNI</label>
              <Input
                type="number"
                value={formData.dni || ''}
                onChange={(e) => handleChange('dni', e.target.value)}
                placeholder="DNI"
                className="h-10 rounded-xl border-border/60 bg-background/60 text-muted-foreground shadow-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/25"
              />
            </div>

            <div className="min-w-0 space-y-2">
              <label className="text-sm font-medium text-foreground">Roles</label>
              <div className="flex min-h-10 flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-background/75 px-3 py-1.5 dark:bg-background/35">
                <RoleChipList roles={account.roles} />
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-green-500/20 bg-green-500/5 px-3 py-2.5 text-sm text-green-700 dark:text-green-400">
              {success}
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 rounded-xl bg-primary px-4 text-primary-foreground shadow-none transition-colors duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
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
    </SettingsSection>
  )
}
