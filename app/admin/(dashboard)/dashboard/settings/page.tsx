'use client'

import { useEffect, useState } from 'react'
import { Loader2, ShieldCheck, Sparkles, UserCog, BadgeCheck } from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
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
    <Card className="rounded-[24px] border border-border/60 bg-card/95 shadow-[0_14px_34px_-22px_rgba(15,23,42,0.14)]">
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
      <AppHeader title="Settings" />

      <div className="flex-1 overflow-auto px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <section className="relative overflow-hidden rounded-[28px] border border-border/60 bg-card/90 px-6 py-7 shadow-[0_24px_80px_-34px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:px-7 sm:py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(36,59,123,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(198,61,79,0.05),transparent_24%)]" />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-5 h-[3px] w-12 rounded-full bg-primary" />

                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/80">
                  Account settings
                </p>

                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-[2.45rem]">
                  Configuración de cuenta y seguridad
                </h2>

                <p className="mt-4 max-w-3xl text-[15px] leading-7 text-muted-foreground">
                  Gestioná tus datos personales, tus roles visibles y la seguridad de acceso desde un único espacio.
                </p>
              </div>

              <div className="group inline-flex items-center gap-3 rounded-2xl border border-border/60 bg-background/80 px-4 py-4 shadow-[0_14px_30px_-22px_rgba(15,23,42,0.16)] transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_22px_40px_-22px_rgba(15,23,42,0.22)]">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Sparkles className="size-5" />
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Módulo
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    Settings
                  </p>
                </div>
              </div>
            </div>
          </section>

          {loading ? (
            <Card className="rounded-[28px] border border-border/60 bg-card/95 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
              <CardContent className="flex min-h-[240px] items-center justify-center">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Cargando configuración...
                </div>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="rounded-[28px] border border-destructive/20 bg-destructive/5 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.10)]">
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

                <Card className="rounded-[24px] border border-border/60 bg-card/95 shadow-[0_14px_34px_-22px_rgba(15,23,42,0.14)]">
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
            <Card className="rounded-[28px] border border-border/60 bg-card/95 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
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