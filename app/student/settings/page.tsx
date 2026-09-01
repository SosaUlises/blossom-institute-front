'use client'

import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, Info } from 'lucide-react'

import {
  AccountProfileForm,
  ChangePasswordForm,
  RoleChipList,
} from '@/components/account/settings'
import { AppHeader } from '@/components/layout/app-header'
import { UserAvatar } from '@/components/shared/user-avatar'
import { Card, CardContent } from '@/components/ui/card'
import {
  deleteMyAvatar,
  getMyAccountSettings,
  updateMyAvatar,
} from '@/lib/account/settings/api'
import type { MyAccountSettings } from '@/lib/account/settings/types'

function CompactState({
  icon: Icon,
  title,
  description,
  tone = 'neutral',
}: {
  icon: typeof AlertCircle
  title: string
  description: string
  tone?: 'neutral' | 'danger'
}) {
  return (
    <Card
      className={
        tone === 'danger'
          ? 'rounded-2xl border border-destructive/20 bg-destructive/5 shadow-[0_1px_2px_rgba(15,23,42,0.035)] dark:bg-destructive/10'
          : 'rounded-2xl border border-border/60 bg-card/95 shadow-[0_1px_2px_rgba(15,23,42,0.035)] dark:border-border/70 dark:bg-card/90'
      }
    >
      <CardContent className="flex items-start gap-3 p-4 sm:p-5">
        <div
          className={
            tone === 'danger'
              ? 'flex size-9 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive'
              : 'flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/15'
          }
        >
          <Icon className="size-4" />
        </div>

        <div className="min-w-0 space-y-1">
          <p
            className={
              tone === 'danger'
                ? 'text-sm font-semibold text-destructive'
                : 'text-sm font-semibold text-foreground'
            }
          >
            {title}
          </p>
          <p
            className={
              tone === 'danger'
                ? 'text-sm leading-5 text-destructive/85 dark:text-destructive'
                : 'text-sm leading-5 text-muted-foreground'
            }
          >
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function StudentSettingsSkeleton() {
  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] sm:p-5 dark:border-border/70 dark:bg-card/90">
        <div className="flex items-center gap-4">
          <div className="size-16 animate-pulse rounded-full bg-muted/40" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-6 w-48 animate-pulse rounded-md bg-muted/40" />
            <div className="h-4 w-64 max-w-full animate-pulse rounded-md bg-muted/30" />
            <div className="h-5 w-28 animate-pulse rounded-full bg-muted/25" />
          </div>
          <div className="hidden h-7 w-24 animate-pulse rounded-lg bg-muted/25 sm:block" />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)] lg:items-start">
        <div className="space-y-3 rounded-xl border border-border/60 bg-card/95 p-4">
          <div className="h-5 w-24 animate-pulse rounded-md bg-muted/40" />
          <div className="h-20 animate-pulse rounded-xl bg-muted/25" />
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-10 animate-pulse rounded-xl bg-muted/25"
              />
            ))}
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-border/60 bg-card/95 p-4">
          <div className="h-5 w-28 animate-pulse rounded-md bg-muted/40" />
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-10 animate-pulse rounded-xl bg-muted/25"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function StudentSettingsPage() {
  const [account, setAccount] = useState<MyAccountSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null)

  const handleAvatarPreviewChange = useCallback((url: string | null) => {
    setAvatarPreviewUrl(url)
  }, [])

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
      <AppHeader title="Mi cuenta" />

      <main className="flex-1 overflow-auto px-5 pb-8 pt-8 sm:pt-9 lg:px-8 lg:pb-8 lg:pt-10">
        <div className="mx-auto max-w-5xl space-y-5">
          <header className="border-b border-border/60 pb-5">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Mi cuenta
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
              Gestioná tu perfil de alumno y mantené actualizada la seguridad de
              acceso.
            </p>
          </header>

          {loading ? (
            <StudentSettingsSkeleton />
          ) : error ? (
            <CompactState
              icon={AlertCircle}
              title="No se pudo cargar tu cuenta"
              description={error}
              tone="danger"
            />
          ) : account ? (
            <>
              <section className="flex min-w-0 flex-col gap-3 rounded-2xl border border-border/60 bg-card/95 px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.035)] dark:border-border/70 dark:bg-card/90 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <UserAvatar
                    name={`${account.nombre} ${account.apellido}`.trim()}
                    avatarUrl={avatarPreviewUrl ?? account.avatarUrl}
                    size={64}
                    className="shrink-0"
                    fallbackClassName="bg-primary/10 text-primary dark:bg-primary/15"
                  />

                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                      {account.nombre} {account.apellido}
                    </p>
                    <p
                      className="truncate text-sm text-muted-foreground"
                      title={account.email}
                    >
                      {account.email}
                    </p>
                    <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
                      <RoleChipList roles={account.roles} />
                    </div>
                  </div>
                </div>

                <span
                  className={`inline-flex w-fit items-center rounded-lg border px-2.5 py-1 text-xs font-medium ${
                    account.activo
                      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                      : 'border-border/60 bg-muted/40 text-muted-foreground'
                  }`}
                >
                  {account.activo ? 'Cuenta activa' : 'Cuenta inactiva'}
                </span>
              </section>

              <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,360px)] lg:items-start">
                <AccountProfileForm
                  account={account}
                  onUpdated={(updated) => setAccount(updated)}
                  description="Foto y datos personales que aparecen en tu espacio de alumno."
                  showRoles={false}
                  avatarProps={{
                    getAccountSettings: getMyAccountSettings,
                    updateAvatar: updateMyAvatar,
                    deleteAvatar: deleteMyAvatar,
                    showAvatarPreview: false,
                    onPreviewUrlChange: handleAvatarPreviewChange,
                  }}
                />

                <ChangePasswordForm
                  description="Cambiá tu contraseña cuando necesites actualizar el acceso a tu cuenta."
                  submitLabel="Guardar contraseña"
                />
              </div>
            </>
          ) : (
            <CompactState
              icon={Info}
              title="Sin datos de cuenta"
              description="No encontramos información disponible para esta cuenta de alumno."
            />
          )}
        </div>
      </main>
    </>
  )
}
