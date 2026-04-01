'use client'

import { useEffect, useState } from 'react'
import {
  Loader2,
  ShieldCheck,
  Sparkles,
  UserCog,
  BadgeCheck,
} from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { Card, CardContent } from '@/components/ui/card'
import { AccountProfileForm } from '@/components/teacher/settings/account-profile-form'
import { ChangePasswordForm } from '@/components/teacher/settings/change-password-form'
import { getMyAccountSettings } from '@/lib/teacher/settings/api'
import type { MyAccountSettings } from '@/lib/teacher/settings/types'

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
    <Card className="rounded-[24px] border border-border/70 bg-card/95 shadow-[0_14px_34px_-22px_rgba(30,42,68,0.16)]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {title}
            </p>
            <p className="mt-2 text-lg font-bold tracking-tight text-foreground">
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

export default function TeacherSettingsPage() {
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
        <div className="mx-auto max-w-6xl space-y-8">
          <section className="relative overflow-hidden rounded-[30px] border border-border/70 bg-card/92 p-7 shadow-[0_24px_70px_-34px_rgba(30,42,68,0.24)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(36,59,123,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(198,61,79,0.08),transparent_26%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(72,99,180,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(198,61,79,0.10),transparent_28%)]" />

            <div className="relative space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                <Sparkles className="size-3.5" />
                Teacher settings
              </div>

              <div className="space-y-3">
                <h2 className="max-w-3xl text-[2rem] font-bold tracking-tight text-foreground">
                  Configuración de cuenta y seguridad
                </h2>

                <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                  Gestioná tus datos personales, tus roles visibles y la seguridad de acceso desde un único espacio.
                </p>
              </div>
            </div>
          </section>

          {loading ? (
            <Card className="rounded-[28px] border border-border/70 bg-card/95 shadow-[0_18px_44px_-24px_rgba(30,42,68,0.18)]">
              <CardContent className="flex min-h-[240px] items-center justify-center">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Cargando configuración...
                </div>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="rounded-[28px] border border-destructive/20 bg-destructive/5 shadow-[0_18px_44px_-24px_rgba(30,42,68,0.10)]">
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

                <Card className="rounded-[24px] border border-border/70 bg-card/95 shadow-[0_14px_34px_-22px_rgba(30,42,68,0.16)]">
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
                              <BadgeCheck className="size-5" />
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
            <Card className="rounded-[28px] border border-border/70 bg-card/95 shadow-[0_18px_44px_-24px_rgba(30,42,68,0.18)]">
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