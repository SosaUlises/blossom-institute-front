'use client'

import { useEffect, useState } from 'react'
import { Loader2, ShieldCheck, UserCog } from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { Card, CardContent } from '@/components/ui/card'
import { AccountProfileForm } from '@/components/settings/account-profile-form'
import { ChangePasswordForm } from '@/components/settings/change-password-form'
import { getMyAccountSettings } from '@/lib/settings/api'
import type { MyAccountSettings } from '@/lib/settings/types'

export default function SettingsPage() {
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
      <AppHeader title="Settings" />

      <div className="flex-1 overflow-auto px-6 py-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <section className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Settings
            </h2>
            <p className="text-sm text-muted-foreground">
              Gestioná la información de tu cuenta y la seguridad de acceso.
            </p>
          </section>

          {loading ? (
            <Card className="border-border/70 bg-card/95">
              <CardContent className="flex min-h-[220px] items-center justify-center">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Cargando configuración...
                </div>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-6 text-sm text-destructive">
                {error}
              </CardContent>
            </Card>
          ) : account ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-border/70 bg-card/95">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <UserCog className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Usuario
                      </p>
                      <p className="truncate text-base font-semibold text-foreground">
                        {account.nombre} {account.apellido}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/70 bg-card/95">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <ShieldCheck className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Estado
                      </p>
                      <p className="text-base font-semibold text-foreground">
                        {account.activo ? 'Activo' : 'Inactivo'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/70 bg-card/95">
                  <CardContent className="p-5">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Rol
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {account.roles.map((role) => (
                        <span
                          key={role}
                          className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <AccountProfileForm
                  account={account}
                  onUpdated={(updated) => setAccount(updated)}
                />

                <ChangePasswordForm />
              </div>
            </>
          ) : (
            <Card className="border-border/70 bg-card/95">
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