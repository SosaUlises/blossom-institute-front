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
                    Recuperar acceso
                  </p>

                  <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-[2.65rem]">
                    ¿Olvidaste tu contraseña?
                  </h1>

                  <p className="mt-4 max-w-md text-[15px] leading-7 text-muted-foreground sm:text-base">
                    Ingresá tu email y te enviaremos las instrucciones para restablecerla.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <FieldGroup className="space-y-6">
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

                  {devResetLink && (
                    <Alert className="rounded-2xl border-accent/20 bg-accent/5 text-foreground">
                      <AlertDescription className="break-all">
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
                      className="mb-2.5 text-sm font-semibold text-foreground"
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
                        className="h-13 rounded-2xl border-border/80 bg-background/90 pl-11 pr-4 text-[15px] text-foreground shadow-none placeholder:text-muted-foreground/80 transition-all duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
                      />
                    </div>
                  </Field>

                  <Button
                    type="submit"
                    className="h-13 w-full rounded-2xl bg-primary text-[15px] font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg active:translate-y-0 active:shadow-md"
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
                    className="inline-flex w-full items-center justify-center gap-2 text-sm font-medium text-primary transition-all duration-200 hover:-translate-x-0.5 hover:text-primary/80 "
                  >
                    <ArrowLeft className="size-4" />
                    Volver al inicio de sesión
                  </Link>
                </FieldGroup>
              </form>
            </div>
          </section>

          <AuthRecoverySidePanel
            imageUrl="/blossom-2.jpg"
            imageAlt="Recuperación de acceso en Blossom Institute"
            imagePosition="center center"
          />
        </div>
      </div>
    </div>
  )
}