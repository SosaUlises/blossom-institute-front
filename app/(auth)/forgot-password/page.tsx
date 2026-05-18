'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, Loader2, Mail } from 'lucide-react'

import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AuthRecoverySidePanel } from '@/components/auth/auth-recovery-side-panel'
import { forgotPasswordRequest } from '@/lib/auth/password-api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [devResetLink, setDevResetLink] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setDevResetLink(null)
    setIsLoading(true)

    try {
      const frontendResetUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/reset-password`
          : ''

      const result = await forgotPasswordRequest({
        email: email.trim(),
        frontendResetUrl,
      })

      setSuccessMessage(
        result.message ||
          'Si el email existe en el sistema, te enviaremos instrucciones para restablecer la contraseña.'
      )

      if (result?.data?.resetLink) {
        setDevResetLink(result.data.resetLink)
      }
    } catch (err: any) {
      setError(err?.message || 'No se pudo procesar la solicitud.')
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
              <div className="mb-10 [@media(max-height:760px)]:mb-6">
                <div className="mb-7 [@media(max-height:760px)]:mb-4">
                  <div className="mb-3 h-1 w-12 rounded-full bg-primary" />
                  <p className="text-base font-semibold tracking-tight text-foreground">
                    Blossom Institute
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Plataforma académica
                  </p>
                </div>

                <div>
                  <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                    Recuperar acceso
                  </p>

                  <h1 className="text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-[2rem]">
                    ¿Olvidaste tu contraseña?
                  </h1>

                  <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                    Ingresá tu email y te enviaremos las instrucciones para restablecerla.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <FieldGroup className="gap-6 [@media(max-height:760px)]:gap-4">
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

                  {devResetLink && (
                    <Alert className="rounded-xl border-accent/20 bg-accent/5 py-3 text-foreground">
                      <AlertDescription className="max-h-24 overflow-y-auto break-all pr-1">
                        Link de prueba en desarrollo:{' '}
                        <a
                          href={devResetLink}
                          className="font-medium text-primary underline underline-offset-4"
                        >
                          {devResetLink}
                        </a>
                      </AlertDescription>
                    </Alert>
                  )}

                  <Field>
                    <FieldLabel
                      htmlFor="email"
                      className="mb-1.5 text-sm font-semibold text-foreground"
                    >
                      Email
                    </FieldLabel>

                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        autoComplete="email"
                        className="h-11 rounded-xl border-border/60 bg-background/75 pl-10 pr-3 text-sm text-foreground shadow-none placeholder:text-muted-foreground/80 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary/15"
                      />
                    </div>
                  </Field>

                  <Button
                    type="submit"
                    className="h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-none transition-colors duration-200 hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Enviar instrucciones'
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
            imageUrl="/blossom-4.jpg"
            imageAlt="Recuperación de acceso en Blossom Institute"
            imagePosition="center center"
          />
        </div>
      </div>
    </div>
  )
}
