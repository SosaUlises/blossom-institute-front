'use client'

import Link from 'next/link'
import { Suspense, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Eye, EyeOff, Loader2, LockKeyhole } from 'lucide-react'

import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AuthRecoverySidePanel } from '@/components/auth/auth-recovery-side-panel'
import { resetPasswordRequest } from '@/lib/auth/password-api'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const email = useMemo(() => searchParams.get('email') || '', [searchParams])
  const token = useMemo(() => searchParams.get('token') || '', [searchParams])

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const missingParams = !email || !token
  const passwordsMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (missingParams) {
      setError('El enlace de recuperación es inválido o incompleto.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setIsLoading(true)

    try {
      const result = await resetPasswordRequest({
        email,
        token,
        newPassword,
        confirmPassword,
      })

      setSuccessMessage(result.message || 'Contraseña restablecida correctamente.')

      setTimeout(() => {
        router.replace('/login')
      }, 1800)
    } catch (err: any) {
      setError(err?.message || 'No se pudo restablecer la contraseña.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex h-full overflow-hidden bg-background px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-5 [@media(max-height:760px)]:py-3">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-[-8%] top-[-10%] h-[260px] w-[260px] rounded-full bg-primary/[0.06] blur-3xl" />
        <div className="absolute bottom-[-12%] right-[-8%] h-[220px] w-[220px] rounded-full bg-primary/[0.035] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,transparent,rgba(36,59,123,0.018),transparent)]" />
      </div>

      <div className="mx-auto flex min-h-0 w-full max-w-[1360px] items-center justify-center">
        <div className="grid w-full max-w-[560px] overflow-hidden rounded-[24px] border border-border/60 bg-card/90 shadow-[0_24px_90px_-35px_rgba(15,23,42,0.28)] backdrop-blur-xl lg:h-full lg:max-h-[760px] lg:max-w-none lg:min-h-0 lg:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)] lg:rounded-[28px] [@media(max-height:760px)]:lg:max-h-full">
          <section className="flex min-h-0 items-center justify-center px-5 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10 xl:px-16 [@media(max-height:760px)]:lg:py-6">
            <div className="w-full max-w-[520px]">
              <div className="mb-6 [@media(max-height:760px)]:mb-4">
                <div className="mb-5 [@media(max-height:760px)]:mb-3">
                  <div className="mb-3 h-1 w-12 rounded-full bg-primary" />
                  <p className="text-base font-semibold tracking-tight text-foreground">
                    Blossom Institute
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Plataforma académica
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                    Restablecer contraseña
                  </p>

                  <h1 className="text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-[2rem]">
                    Creá una nueva contraseña
                  </h1>

                  <p className="mt-2 max-w-md text-sm leading-5 text-muted-foreground">
                    Ingresá y confirmá tu nueva contraseña.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <FieldGroup className="gap-4.5 [@media(max-height:760px)]:gap-3.5">
                  {missingParams && (
                    <Alert className="rounded-xl border-destructive/25 bg-destructive/5 py-3 text-destructive">
                      <AlertDescription>
                        El enlace de recuperación es inválido o incompleto.
                      </AlertDescription>
                    </Alert>
                  )}

                  {error && (
                    <Alert className="rounded-xl border-destructive/25 bg-destructive/5 py-3 text-destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {successMessage && (
                    <Alert className="rounded-xl border-primary/20 bg-primary/5 py-3 text-foreground">
                      <AlertDescription>{successMessage}</AlertDescription>
                    </Alert>
                  )}

                  <Field className="space-y-0">
                    <FieldLabel className="mb-1.5 text-sm font-semibold text-foreground">
                      Email
                    </FieldLabel>
                    <Input
                      type="email"
                      value={email}
                      disabled
                      className="h-10 rounded-xl border-border/60 bg-muted/35 px-3 text-sm text-muted-foreground shadow-none"
                    />
                  </Field>

                  <Field className="space-y-0">
                    <FieldLabel
                      htmlFor="newPassword"
                      className="mb-1.5 text-sm font-semibold text-foreground"
                    >
                      Nueva contraseña
                    </FieldLabel>

                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Ingresá tu nueva contraseña"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        disabled={isLoading || missingParams}
                        autoComplete="new-password"
                        className="h-11 rounded-xl border-border/60 bg-background/75 pl-10 pr-11 text-sm text-foreground shadow-none placeholder:text-muted-foreground/80 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary/15"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-9 w-9 rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-primary/8 hover:text-primary"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        disabled={isLoading || missingParams}
                      >
                        {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        <span className="sr-only">
                          {showNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        </span>
                      </Button>
                    </div>
                  </Field>

                  <Field className="space-y-0">
                    <FieldLabel
                      htmlFor="confirmPassword"
                      className="mb-1.5 text-sm font-semibold text-foreground"
                    >
                      Repetir nueva contraseña
                    </FieldLabel>

                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Repetí tu nueva contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        aria-invalid={passwordsMismatch}
                        disabled={isLoading || missingParams}
                        autoComplete="new-password"
                        className="h-11 rounded-xl border-border/60 bg-background/75 pl-10 pr-11 text-sm text-foreground shadow-none placeholder:text-muted-foreground/80 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary/15"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-9 w-9 rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-primary/8 hover:text-primary"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading || missingParams}
                      >
                        {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        <span className="sr-only">
                          {showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        </span>
                      </Button>
                    </div>
                    {passwordsMismatch ? (
                      <p className="text-sm text-destructive">
                        Las contraseñas no coinciden.
                      </p>
                    ) : null}
                  </Field>

                  <Button
                    type="submit"
                    className="h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-none transition-colors duration-200 hover:bg-primary/90"
                    disabled={isLoading || missingParams}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      'Restablecer contraseña'
                    )}
                  </Button>

                  <Link
                    href="/login"
                   className="inline-flex w-full items-center justify-center gap-2 text-sm font-medium text-primary transition-colors duration-200 hover:text-primary/80"
                  >
                    <ArrowLeft className="size-4" />
                    Volver al inicio de sesión
                  </Link>
                </FieldGroup>
              </form>

            </div>
          </section>

          <AuthRecoverySidePanel
            imageUrl="/blossom-6.jpg"
            imageAlt="Restablecimiento de contraseña en Blossom Institute"
            imagePosition="center center"
          />
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  )
}
