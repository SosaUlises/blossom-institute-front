'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Eye, EyeOff, Loader2, LockKeyhole } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
                Creá una nueva contraseña para tu cuenta
              </p>
            </div>

            <Card className="rounded-3xl border border-slate-200/80 bg-white shadow-[0_24px_80px_-24px_rgba(15,23,42,0.28)]">
              <CardHeader className="space-y-2 pb-6 text-center">
                <CardTitle className="text-2xl font-bold text-foreground">
                  Restablecer contraseña
                </CardTitle>
                <CardDescription className="text-sm text-slate-500">
                  Ingresá y confirmá tu nueva contraseña
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit}>
                  <FieldGroup className="space-y-5">
                    {missingParams && (
                      <Alert variant="destructive" className="rounded-2xl border-destructive/20">
                        <AlertDescription>
                          El enlace de recuperación es inválido o incompleto.
                        </AlertDescription>
                      </Alert>
                    )}

                    {error && (
                      <Alert variant="destructive" className="rounded-2xl border-destructive/20">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {successMessage && (
                      <Alert className="rounded-2xl border-primary/20 bg-primary/5 text-foreground">
                        <AlertDescription>{successMessage}</AlertDescription>
                      </Alert>
                    )}

                    <Field>
                      <FieldLabel className="text-sm font-semibold text-foreground">
                        Email
                      </FieldLabel>
                      <Input
                        type="email"
                        value={email}
                        disabled
                        className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 text-slate-500 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)]"
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="newPassword" className="text-sm font-semibold text-foreground">
                        Nueva contraseña
                      </FieldLabel>

                      <div className="relative">
                        <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="Ingresá tu nueva contraseña"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          disabled={isLoading || missingParams}
                          autoComplete="new-password"
                          className="h-12 rounded-2xl border-slate-200 bg-slate-50/80 pl-11 pr-11 text-foreground shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] placeholder:text-slate-400 focus-visible:border-primary/40 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-primary/10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1 h-10 w-10 rounded-xl text-muted-foreground hover:bg-primary/5 hover:text-primary"
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
                      <FieldLabel htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">
                        Confirmar contraseña
                      </FieldLabel>

                      <div className="relative">
                        <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Repetí tu nueva contraseña"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          disabled={isLoading || missingParams}
                          autoComplete="new-password"
                          className="h-12 rounded-2xl border-slate-200 bg-slate-50/80 pl-11 pr-11 text-foreground shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] placeholder:text-slate-400 focus-visible:border-primary/40 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-primary/10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1 h-10 w-10 rounded-xl text-muted-foreground hover:bg-primary/5 hover:text-primary"
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
                      className="h-12 w-full rounded-2xl bg-primary text-primary-foreground shadow-[0_10px_30px_-10px_rgba(36,59,123,0.45)] transition hover:bg-primary/90"
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