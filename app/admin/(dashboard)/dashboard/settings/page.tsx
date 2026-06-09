'use client'

import { useEffect, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { AccountProfileForm } from '@/components/account/settings/account-profile-form'
import { ChangePasswordForm } from '@/components/account/settings/change-password-form'
import { RoleChipList } from '@/components/account/settings/role-chip-list'
import { UserAvatar } from '@/components/shared/user-avatar'
import { WorkspaceHeader } from '@/components/shared/workspace-header'
import { Card, CardContent } from '@/components/ui/card'
import {
  deleteMyAvatar,
  changeMyPassword,
  getMyAccountSettings,
  updateMyAccountSettings,
  updateMyAvatar,
} from '@/lib/admin/settings/api'
import type { MyAccountSettings } from '@/lib/admin/settings/types'

function ProfileIdentityHeader({ account }: { account: MyAccountSettings }) {
  const fullName = `${account.nombre} ${account.apellido}`.trim()

  return (
    <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] dark:bg-card/90 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <UserAvatar
            name={fullName}
            avatarUrl={account.avatarUrl}
            size={64}
            className="shrink-0"
            fallbackClassName="bg-primary/10 text-primary dark:bg-primary/15"
          />

          <div className="min-w-0">
            <p className="truncate text-lg font-semibold tracking-tight text-foreground">
              {fullName}
            </p>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {account.email}
            </p>
            <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2">
              <RoleChipList roles={account.roles} />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 rounded-xl border border-border/60 bg-background/75 px-3 py-2 text-sm dark:bg-background/35">
          <CheckCircle2
            className={
              account.activo
                ? 'size-4 text-emerald-600 dark:text-emerald-400'
                : 'size-4 text-muted-foreground'
            }
          />
          <span className="font-medium text-foreground">
            {account.activo ? 'Cuenta activa' : 'Cuenta inactiva'}
          </span>
        </div>
      </div>
    </section>
  )
}

function SettingsSkeleton() {
  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] dark:bg-card/90 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="size-16 animate-pulse rounded-full bg-muted/45" />
            <div className="space-y-2">
              <div className="h-5 w-44 animate-pulse rounded-md bg-muted/50" />
              <div className="h-4 w-56 animate-pulse rounded-md bg-muted/35" />
              <div className="flex gap-2 pt-1">
                <div className="h-6 w-20 animate-pulse rounded-full bg-muted/35" />
                <div className="h-6 w-24 animate-pulse rounded-full bg-muted/35" />
              </div>
            </div>
          </div>
          <div className="h-9 w-32 animate-pulse rounded-xl bg-muted/35" />
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,390px)]">
        <section className="rounded-xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] dark:bg-card/90">
          <div className="mb-5 flex items-start gap-2.5">
            <div className="size-9 animate-pulse rounded-xl bg-muted/45" />
            <div className="space-y-2">
              <div className="h-5 w-24 animate-pulse rounded-md bg-muted/50" />
              <div className="h-4 w-44 animate-pulse rounded-md bg-muted/35" />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-4 w-20 animate-pulse rounded-md bg-muted/35" />
                <div className="h-10 animate-pulse rounded-xl bg-muted/35" />
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-4">
          <section className="rounded-xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] dark:bg-card/90">
            <div className="mb-4 flex items-start gap-2.5">
              <div className="size-9 animate-pulse rounded-xl bg-muted/45" />
              <div className="space-y-2">
                <div className="h-5 w-28 animate-pulse rounded-md bg-muted/50" />
                <div className="h-4 w-48 animate-pulse rounded-md bg-muted/35" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-10 animate-pulse rounded-xl bg-muted/35" />
              <div className="h-10 animate-pulse rounded-xl bg-muted/25" />
              <div className="h-10 animate-pulse rounded-xl bg-muted/20" />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function CompactState({
  icon: Icon,
  title,
  description,
  tone = 'neutral',
}: {
  icon: LucideIcon
  title: string
  description: string
  tone?: 'neutral' | 'danger'
}) {
  return (
    <Card
      className={
        tone === 'danger'
          ? 'rounded-2xl border border-destructive/20 bg-destructive/5 shadow-[0_1px_2px_rgba(15,23,42,0.035)] dark:bg-destructive/10'
          : 'rounded-2xl border border-border/60 bg-card/95 shadow-[0_1px_2px_rgba(15,23,42,0.035)] dark:bg-card/90'
      }
    >
      <CardContent className="flex items-start gap-3 p-4 sm:p-5">
        <div
          className={
            tone === 'danger'
              ? 'flex size-9 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive'
              : 'flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'
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
      <AppHeader title="Mi cuenta" />

      <div className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-5xl space-y-5">
          <WorkspaceHeader
            title="Mi cuenta"
            description="Gestioná tu identidad de administrador y la seguridad de acceso."
          />
          {loading ? (
            <SettingsSkeleton />
          ) : error ? (
            <CompactState
              icon={AlertCircle}
              title="No se pudo cargar tu configuración"
              description={error}
              tone="danger"
            />
          ) : account ? (
            <>
              <ProfileIdentityHeader account={account} />

              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,390px)] xl:items-start">
                <AccountProfileForm
                  account={account}
                  onUpdated={(updated) => setAccount(updated)}
                  updateAccount={updateMyAccountSettings}
                  description="Foto de perfil y datos visibles de tu cuenta administrativa."
                  showRoles={false}
                  avatarProps={{
                    getAccountSettings: getMyAccountSettings,
                    updateAvatar: updateMyAvatar,
                    deleteAvatar: deleteMyAvatar,
                  }}
                />

                <div className="space-y-4">
                  <ChangePasswordForm
                    changePassword={changeMyPassword}
                    description="Cambiá tu contraseña cuando necesites reforzar el acceso."
                    submitLabel="Cambiar contraseña"
                  />
                </div>
              </div>
            </>
          ) : (
            <CompactState
              icon={Info}
              title="Sin datos de cuenta"
              description="No encontramos información disponible para este administrador."
            />
          )}
        </div>
      </div>
    </>
  )
}
