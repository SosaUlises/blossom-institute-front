'use client'

import { useEffect, useState } from 'react'
import { Loader2, ShieldCheck, Sparkles, UserCog, BadgeCheck } from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { WorkspaceHeader } from '@/components/shared/workspace-header'
import { Card, CardContent } from '@/components/ui/card'
import { AccountProfileForm } from '@/components/admin/settings/account-profile-form'
import { ChangePasswordForm } from '@/components/admin/settings/change-password-form'
import { getMyAccountSettings } from '@/lib/admin/settings/api'
import type { MyAccountSettings } from '@/lib/admin/settings/types'

function SummaryCard({
  title,
  value,
  subvalue,
  icon: Icon,
  accent = 'blue',
}: {
  title: string
  value: string | number
  subvalue?: string
  icon: React.ComponentType<{ className?: string }>
  accent?: 'blue' | 'emerald' | 'violet' | 'amber'
}) {
  const accentStyles =
    accent === 'emerald'
      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
      : accent === 'violet'
        ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
        : accent === 'amber'
          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'

  return (
    <Card className="rounded-xl border border-border/60 bg-card/95 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {title}
            </p>
            <p className="mt-2 text-lg font-semibold tracking-tight text-foreground">
              {value}
            </p>
            {subvalue && (
              <p className="mt-1 text-sm text-muted-foreground">{subvalue}</p>
            )}
          </div>

          <div className={`flex size-11 items-center justify-center rounded-2xl ${accentStyles}`}>
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

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
      <AppHeader title="Configuración" />

      <div className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-6xl space-y-5">
          <WorkspaceHeader
            title="Configuración de cuenta y seguridad"
            description="Gestiona datos personales, roles visibles y acceso."
            metadata={
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <span className="font-medium text-foreground">Módulo configuración</span>
              </div>
            }
          />
          {loading ? (
            <Card className="rounded-2xl border border-border/60 bg-card/95 shadow-sm">
              <CardContent className="flex min-h-[240px] items-center justify-center">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Cargando configuración...
                </div>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="rounded-2xl border border-destructive/20 bg-destructive/5 shadow-sm">
              <CardContent className="p-6 text-sm text-destructive">
                {error}
              </CardContent>
            </Card>
          ) : account ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <SummaryCard
                  title="Usuario"
                  value={`${account.nombre} ${account.apellido}`}
                  subvalue={account.email}
                  icon={UserCog}
                  accent="blue"
                />

                <SummaryCard
                  title="Estado"
                  value={account.activo ? 'Activo' : 'Inactivo'}
                  subvalue="Estado actual de la cuenta"
                  icon={ShieldCheck}
                  accent="emerald"
                />

                <Card className="rounded-xl border border-border/60 bg-card/95 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Roles
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
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

                      <div className="flex size-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                        <BadgeCheck className="size-5" />
                      </div>
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
            <Card className="rounded-2xl border border-border/60 bg-card/95 shadow-sm">
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
