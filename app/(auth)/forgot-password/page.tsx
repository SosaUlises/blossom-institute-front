'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, Loader2, Mail } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
        result.message || 'Si el email existe en el sistema, te enviaremos instrucciones para restablecer la contraseña.'
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
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-[1.02fr_0.98fr]">
        <AuthRecoverySidePanel />

        <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(36,59,123,0.05),transparent_30%),#f8fafc] px-6 py-10">
          <div className="w-full max-w-md">
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="overflow-hidden rounded-full border border-primary/10 bg-white shadow-lg shadow-primary/5">
                <Image
                  src="/logo-blossom.png"
                  alt="Blossom Institute"
                  width={120}
                  height={120}
                  className="h-35 w-35 object-cover"
                  priority
                />
              </div>

              <p className="mt-5 text-sm text-slate-500">
                Recuperá el acceso a tu cuenta
              </p>
            </div>

            <Card className="rounded-3xl border border-slate-200/80 bg-white shadow-[0_24px_80px_-24px_rgba(15,23,42,0.28)]">
              <CardHeader className="space-y-2 pb-6 text-center">
                <CardTitle className="text-2xl font-bold text-foreground">
                  ¿Olvidaste tu contraseña?
                </CardTitle>
                <CardDescription className="text-sm text-slate-500">
                  Ingresá tu email y te enviaremos instrucciones para restablecerla
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit}>
                  <FieldGroup className="space-y-5">
                    {error && (
                      <Alert variant="destructive" className="border-destructive/20 rounded-2xl">
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
                            className="font-medium text-primary underline"
                          >
                            {devResetLink}
                          </a>
                        </AlertDescription>
                      </Alert>
                    )}

                    <Field>
                      <FieldLabel htmlFor="email" className="text-sm font-semibold text-foreground">
                        Email
                      </FieldLabel>

                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="email@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={isLoading}
                          autoComplete="email"
                          className="h-12 rounded-2xl border-slate-200 bg-slate-50/80 pl-11 pr-4 text-foreground shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] placeholder:text-slate-400 focus-visible:border-primary/40 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-primary/10"
                        />
                      </div>
                    </Field>

                    <Button
                      type="submit"
                      className="h-12 w-full rounded-2xl bg-primary text-primary-foreground shadow-[0_10px_30px_-10px_rgba(36,59,123,0.45)] transition hover:bg-primary/90"
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
                      className="inline-flex w-full items-center justify-center gap-2 text-sm font-medium text-primary transition hover:text-accent"
                    >
                      <ArrowLeft className="size-4" />
                      Volver al inicio de sesión
                    </Link>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}