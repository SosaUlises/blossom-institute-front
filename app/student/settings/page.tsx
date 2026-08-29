'use client'

import { useEffect, useState } from 'react'
import { Loader2, UserRound } from 'lucide-react'

import { AccountAvatarSection } from '@/components/account/settings/account-avatar-section'
import { ChangePasswordForm } from '@/components/account/settings/change-password-form'
import { RoleChipList } from '@/components/account/settings/role-chip-list'
import { SettingsSection } from '@/components/account/settings/settings-section'
import { AppHeader } from '@/components/layout/app-header'
import { Card, CardContent } from '@/components/ui/card'
import { getMyAccountSettings } from '@/lib/account/settings/api'
import type { MyAccountSettings } from '@/lib/account/settings/types'

export default function StudentSettingsPage() {
  const [account, setAccount] = useState<MyAccountSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyAccountSettings()
        setAccount(data)
      } catch (err: any) {
        setError(err?.message || 'No se pudo cargar la configuración.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return (
    <>
      <AppHeader title="Mi cuenta" subtitle="Blossom Institute · Alumno" />

      <div className="flex-1 overflow-auto px-5 pb-5 pt-8 sm:pt-9 lg:px-8 lg:pb-6 lg:pt-10">
        <div className="mx-auto max-w-6xl space-y-4">
          <header className="space-y-1 border-b border-border/60 pb-4">
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Mi cuenta
            </h2>
            <p className="text-sm text-muted-foreground">
              Actualizá tu foto de perfil y la seguridad de acceso.
            </p>
          </header>

          {loading ? (
            <Card className="rounded-xl border border-border/70 bg-card/95 shadow-[0_1px_2px_rgba(15,23,42,0.035)] dark:bg-card/90">
              <CardContent className="flex min-h-[240px] items-center justify-center">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Cargando configuración...
                </div>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="rounded-xl border border-destructive/20 bg-destructive/5 shadow-[0_1px_2px_rgba(15,23,42,0.035)]">
              <CardContent className="p-6 text-sm text-destructive">
                {error}
              </CardContent>
            </Card>
          ) : account ? (
            <>
              <section className="flex min-w-0 flex-col gap-3 rounded-xl border border-border/70 bg-card/95 px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.035)] dark:bg-card/90 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold tracking-tight text-foreground">
                    {account.nombre} {account.apellido}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {account.email}
                  </p>
                </div>

                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
                      account.activo
                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                        : 'border-border/60 bg-muted/40 text-muted-foreground'
                    }`}
                  >
                    {account.activo ? 'Activo' : 'Inactivo'}
                  </span>

                  <RoleChipList roles={account.roles} />
                </div>
              </section>

              <div className="grid min-w-0 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                <SettingsSection
                  icon={UserRound}
                  title="Perfil"
                  description="Foto de perfil y datos de cuenta."
                >
                  <div className="space-y-3">
                    <AccountAvatarSection
                      account={account}
                      onUpdated={(updated) => setAccount(updated)}
                    />

                    <div className="rounded-xl border border-border/60 bg-background/75 px-4 py-3 text-sm text-muted-foreground dark:bg-background/35">
                      Si necesitás cambiar algún dato personal de tu cuenta,
                      comunicate con tu profesor.
                    </div>
                  </div>
                </SettingsSection>

                <ChangePasswordForm />
              </div>
            </>
          ) : (
            <Card className="rounded-xl border border-border/70 bg-card/95 shadow-[0_1px_2px_rgba(15,23,42,0.035)] dark:bg-card/90">
              <CardContent className="p-6 text-sm text-muted-foreground">
                No se encontraron datos de cuenta.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
