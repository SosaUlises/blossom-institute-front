'use client'

import { useEffect, useState } from 'react'

import {
  AccountProfileForm,
  ChangePasswordForm,
  RoleChipList,
} from '@/components/account/settings'
import { AppHeader } from '@/components/layout/app-header'
import { UserAvatar } from '@/components/shared/user-avatar'
import {
  changeMyPassword,
  deleteMyAvatar,
  getMyAccountSettings,
  updateMyAccountSettings,
  updateMyAvatar,
} from '@/lib/teacher/settings/api'
import type { MyAccountSettings } from '@/lib/teacher/settings/types'

function TeacherSettingsSkeleton() {
  return (
    <div className="space-y-4">
      <section className="flex items-center gap-4 border-b border-border/60 pb-5">
        <div className="size-16 animate-pulse rounded-full bg-muted/40" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-6 w-48 animate-pulse rounded-md bg-muted/40" />
          <div className="h-4 w-64 max-w-full animate-pulse rounded-md bg-muted/30" />
          <div className="h-5 w-28 animate-pulse rounded-full bg-muted/25" />
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
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

export default function TeacherSettingsPage() {
  const [account, setAccount] = useState<MyAccountSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyAccountSettings()
        setAccount(data)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'No se pudo cargar la configuración.',
        )
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return (
    <>
      <AppHeader title="Mi cuenta" />

      <main className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-6xl space-y-4">
          <header className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Mi cuenta
            </h1>
            <p className="text-sm text-muted-foreground">
              Tu perfil docente y la seguridad de acceso.
            </p>
          </header>

          {loading ? (
            <TeacherSettingsSkeleton />
          ) : error ? (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : account ? (
            <>
              <section className="flex min-w-0 flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <UserAvatar
                    name={`${account.nombre} ${account.apellido}`.trim()}
                    avatarUrl={account.avatarUrl}
                    size={64}
                    className="shrink-0"
                    fallbackClassName="bg-primary/10 text-primary dark:bg-primary/15"
                  />

                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold tracking-tight text-foreground">
                      {account.nombre} {account.apellido}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {account.email}
                    </p>
                    <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
                      <RoleChipList roles={account.roles} />
                    </div>
                  </div>
                </div>

                <span
                  className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
                    account.activo
                      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                      : 'border-border/60 bg-muted/40 text-muted-foreground'
                  }`}
                >
                  {account.activo ? 'Cuenta activa' : 'Cuenta inactiva'}
                </span>
              </section>

              <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] xl:items-start">
                <AccountProfileForm
                  account={account}
                  onUpdated={(updated) => setAccount(updated)}
                  updateAccount={updateMyAccountSettings}
                  description="Foto y datos personales visibles en tu espacio docente."
                  showRoles={false}
                  avatarProps={{
                    getAccountSettings: getMyAccountSettings,
                    updateAvatar: updateMyAvatar,
                    deleteAvatar: deleteMyAvatar,
                  }}
                />

                <ChangePasswordForm changePassword={changeMyPassword} />
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-border/70 bg-muted/10 px-4 py-5 text-sm text-muted-foreground">
              No encontramos datos para esta cuenta docente.
            </div>
          )}
        </div>
      </main>
    </>
  )
}
