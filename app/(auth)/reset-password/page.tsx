'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Eye, EyeOff, Loader2, LockKeyhole } from 'lucide-react'

import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AuthRecoverySidePanel } from '@/components/auth/auth-recovery-side-panel'
import { resetPasswordRequest } from '@/lib/auth/password-api'

export default function ResetPasswordPage() {
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
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-[-8%] top-[-8%] h-[320px] w-[320px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-8%] h-[280px] w-[280px] rounded-full bg-accent/8 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,transparent,rgba(36,59,123,0.03),transparent)]" />
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[28px] border border-border/60 bg-card/90 shadow-[0_24px_90px_-35px_rgba(15,23,42,0.28)] backdrop-blur-xl lg:grid-cols-[1fr_1.05fr]">
          <section className="flex items-center justify-center px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12 xl:px-16">
            <div className="w-full max-w-lg">
              <div className="mb-10">
                <div className="mb-6">
                  <p className="text-[1.5rem] font-semibold tracking-tight text-foreground">
                    Blossom Institute
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Academic management platform
                  </p>
                </div>

                <div className="mb-6 h-[3px] w-12 rounded-full bg-primary" />

                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary/80">
                    Restablecer contraseña
                  </p>

                  <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-[2.65rem]">
                    Creá una nueva contraseña
                  </h1>

                  <p className="mt-4 max-w-md text-[15px] leading-7 text-muted-foreground sm:text-base">
                    Ingresá y confirmá tu nueva contraseña para recuperar el acceso a tu cuenta.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <FieldGroup className="space-y-6">
                  {missingParams && (
                    <Alert className="rounded-2xl border-destructive/25 bg-destructive/5 text-destructive">
                      <AlertDescription>
                        El enlace de recuperación es inválido o incompleto.
                      </AlertDescription>
                    </Alert>
                  )}

                  {error && (
                    <Alert className="rounded-2xl border-destructive/25 bg-destructive/5 text-destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {successMessage && (
                    <Alert className="rounded-2xl border-primary/20 bg-primary/5 text-foreground">
                      <AlertDescription>{successMessage}</AlertDescription>
                    </Alert>
                  )}

                  <Field>
                    <FieldLabel className="mb-2.5 text-sm font-semibold text-foreground">
                      Email
                    </FieldLabel>
                    <Input
                      type="email"
                      value={email}
                      disabled
                      className="h-13 rounded-2xl border-border/70 bg-muted/50 px-4 text-[15px] text-muted-foreground shadow-none"
                    />
                  </Field>

                  <Field>
                    <FieldLabel
                      htmlFor="newPassword"
                      className="mb-2.5 text-sm font-semibold text-foreground"
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
                        className="h-13 rounded-2xl border-border/80 bg-background/90 pl-11 pr-12 text-[15px] text-foreground shadow-none placeholder:text-muted-foreground/80 transition-all duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1.5 top-1.5 h-10 w-10 rounded-xl text-muted-foreground transition-all duration-200 hover:bg-primary/8 hover:text-primary"
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

                  <Field>
                    <FieldLabel
                      htmlFor="confirmPassword"
                      className="mb-2.5 text-sm font-semibold text-foreground"
                    >
                      Confirmar contraseña
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
                        disabled={isLoading || missingParams}
                        autoComplete="new-password"
                        className="h-13 rounded-2xl border-border/80 bg-background/90 pl-11 pr-12 text-[15px] text-foreground shadow-none placeholder:text-muted-foreground/80 transition-all duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1.5 top-1.5 h-10 w-10 rounded-xl text-muted-foreground transition-all duration-200 hover:bg-primary/8 hover:text-primary"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading || missingParams}
                      >
                        {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        <span className="sr-only">
                          {showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        </span>
                      </Button>
                    </div>
                  </Field>

                  <Button
                    type="submit"
                    className="h-13 w-full rounded-2xl bg-primary text-[15px] font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg active:translate-y-0 active:shadow-md"
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
                   className="inline-flex w-full items-center justify-center gap-2 text-sm font-medium text-primary transition-all duration-200 hover:-translate-x-0.5 hover:text-primary/80"
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