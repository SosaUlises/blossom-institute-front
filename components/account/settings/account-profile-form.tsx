'use client'

import { useEffect, useId, useState } from 'react'
import { Loader2, Save, UserRound } from 'lucide-react'

import { AccountAvatarSection } from '@/components/account/settings/account-avatar-section'
import { RoleChipList } from '@/components/account/settings/role-chip-list'
import { SettingsSection } from '@/components/account/settings/settings-section'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateMyAccountSettings as defaultUpdateMyAccountSettings } from '@/lib/account/settings/api'
import type {
  MyAccountSettings,
  UpdateMyAccountSettingsDTO,
} from '@/lib/account/settings/types'

interface AccountProfileFormProps {
  account: MyAccountSettings
  onUpdated: (updated: MyAccountSettings) => void
  updateAccount?: (
    payload: UpdateMyAccountSettingsDTO,
  ) => Promise<MyAccountSettings>
  title?: string
  description?: string
  showAvatar?: boolean
  showRoles?: boolean
  avatarProps?: Omit<
    Parameters<typeof AccountAvatarSection>[0],
    'account' | 'onUpdated'
  >
}

export function AccountProfileForm({
  account,
  onUpdated,
  updateAccount = defaultUpdateMyAccountSettings,
  title = 'Perfil',
  description = 'Datos personales.',
  showAvatar = true,
  showRoles = true,
  avatarProps,
}: AccountProfileFormProps) {
  const formId = useId()
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
    value: string,
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
      const updated = await updateAccount({
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
      title={title}
      description={description}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {showAvatar ? (
          <AccountAvatarSection
            account={account}
            onUpdated={onUpdated}
            {...avatarProps}
          />
        ) : null}

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor={`${formId}-nombre`}
              className="text-sm font-medium text-foreground"
            >
              Nombre
            </label>
            <Input
              id={`${formId}-nombre`}
              value={formData.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              placeholder="Nombre"
              className="h-10 rounded-xl border-border/60 bg-background/75 shadow-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor={`${formId}-apellido`}
              className="text-sm font-medium text-foreground"
            >
              Apellido
            </label>
            <Input
              id={`${formId}-apellido`}
              value={formData.apellido}
              onChange={(e) => handleChange('apellido', e.target.value)}
              placeholder="Apellido"
              className="h-10 rounded-xl border-border/60 bg-background/75 shadow-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35"
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor={`${formId}-email`}
              className="text-sm font-medium text-foreground"
            >
              Email
            </label>
            <Input
              id={`${formId}-email`}
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="email@ejemplo.com"
              className="h-10 rounded-xl border-border/60 bg-background/75 shadow-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor={`${formId}-telefono`}
              className="text-sm font-medium text-foreground"
            >
              Teléfono
            </label>
            <Input
              id={`${formId}-telefono`}
              value={formData.telefono ?? ''}
              onChange={(e) => handleChange('telefono', e.target.value)}
              placeholder="341..."
              className="h-10 rounded-xl border-border/60 bg-background/75 shadow-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35"
            />
          </div>
        </div>

        <div
          className={
            showRoles
              ? 'grid gap-3 md:grid-cols-[180px_minmax(0,1fr)]'
              : 'grid gap-3 md:grid-cols-[180px]'
          }
        >
          <div className="space-y-1.5">
            <label
              htmlFor={`${formId}-dni`}
              className="text-sm font-medium text-muted-foreground"
            >
              DNI
            </label>
            <Input
              id={`${formId}-dni`}
              type="number"
              value={formData.dni || ''}
              onChange={(e) => handleChange('dni', e.target.value)}
              placeholder="DNI"
              className="h-10 rounded-xl border-border/60 bg-background/60 text-muted-foreground shadow-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/25"
            />
          </div>

          {showRoles ? (
            <div className="min-w-0 space-y-1.5">
              <p className="text-sm font-medium text-foreground">Roles</p>
              <div className="flex min-h-10 flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-background/75 px-3 py-1.5 dark:bg-background/35">
                <RoleChipList roles={account.roles} />
              </div>
            </div>
          ) : null}
        </div>

        {error && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive dark:bg-destructive/10">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 px-3 py-2.5 text-sm text-green-700 dark:bg-green-500/10 dark:text-green-400">
            {success}
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-10 w-full rounded-xl bg-primary px-4 text-primary-foreground shadow-none transition-[background-color,transform] duration-200 hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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
