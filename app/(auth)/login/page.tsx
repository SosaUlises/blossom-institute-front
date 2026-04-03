'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'

function getDefaultRouteByRoles(roles: string[]) {
  if (roles.includes('Administrador')) return '/admin/dashboard'
  if (roles.includes('Profesor')) return '/teacher/dashboard'
  if (roles.includes('Alumno')) return '/student/dashboard'
  return '/login'
}

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })

  useEffect(() => {
    fetch('/api/auth/me', { method: 'GET', credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) return null
        return res.json()
      })
      .then((data) => {
        if (data?.success && data?.data?.roles) {
          router.replace(getDefaultRouteByRoles(data.data.roles))
        }
      })
      .catch(() => {})
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
          rememberMe: formData.rememberMe,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        if (response.status === 400) {
          setError('Revisá los datos ingresados.')
        } else if (response.status === 401) {
          setError('Usuario o contraseña incorrectos.')
        } else if (response.status === 403) {
          setError(result.message || 'No tenés permisos para acceder.')
        } else if (response.status === 423) {
          setError('Tu cuenta está bloqueada temporalmente. Intentá más tarde.')
        } else {
          setError(result.message || 'Ocurrió un error al iniciar sesión.')
        }

        return
      }

      const meResponse = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      })

      const meResult = await meResponse.json()

      if (!meResponse.ok || !meResult?.success || !meResult?.data?.roles) {
        throw new Error('No se pudo resolver la redirección del usuario.')
      }

      router.replace(getDefaultRouteByRoles(meResult.data.roles))
      router.refresh()
    } catch (err: any) {
      setError(err?.message || 'Ocurrió un error al iniciar sesión.')
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
                    Iniciar sesión
                  </p>

                  <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-[2.65rem]">
                    Bienvenido
                  </h1>

                  <p className="mt-4 max-w-md text-[15px] leading-7 text-muted-foreground sm:text-base">
                    Accedé a tu espacio académico para continuar.
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

                  <Field>
                    <FieldLabel
                      htmlFor="email"
                      className="mb-2.5 text-sm font-semibold text-foreground"
                    >
                      Email
                    </FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                      disabled={isLoading}
                      autoComplete="email"
                      className="h-13 rounded-2xl border-border/80 bg-background/90 px-4 text-[15px] text-foreground shadow-none placeholder:text-muted-foreground/80 transition-all duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
                    />
                  </Field>

                  <Field>
                    <FieldLabel
                      htmlFor="password"
                      className="mb-2.5 text-sm font-semibold text-foreground"
                    >
                      Contraseña
                    </FieldLabel>

                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Ingresá tu contraseña"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        required
                        disabled={isLoading}
                        autoComplete="current-password"
                        className="h-13 rounded-2xl border-border/80 bg-background/90 px-4 pr-12 text-[15px] text-foreground shadow-none placeholder:text-muted-foreground/80 transition-all duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1.5 top-1.5 h-10 w-10 rounded-xl text-muted-foreground transition-all duration-200 hover:bg-primary/8 hover:text-primary"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                        <span className="sr-only">
                          {showPassword
                            ? 'Ocultar contraseña'
                            : 'Mostrar contraseña'}
                        </span>
                      </Button>
                    </div>
                  </Field>

                  <div className="flex items-center justify-between gap-4 pt-1">
                    <div className="flex items-center gap-2.5">
                      <Checkbox
                        id="remember"
                        checked={formData.rememberMe}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            rememberMe: checked === true,
                          })
                        }
                        disabled={isLoading}
                      />
                      <label
                        htmlFor="remember"
                        className="cursor-pointer text-sm text-muted-foreground"
                      >
                        Recordarme
                      </label>
                    </div>

                    <Link
                      href="/forgot-password"
                      className="text-sm font-medium text-primary transition-all duration-200 hover:-translate-y-0.5  active:translate-y-0 "
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="h-13 w-full rounded-2xl bg-primary text-[15px] font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg active:translate-y-0 active:shadow-md"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Ingresando...
                      </>
                    ) : (
                      'Ingresar'
                    )}
                  </Button>
                </FieldGroup>
              </form>
            </div>
          </section>

          <section className="relative hidden min-h-[680px] lg:block">
            <div className="absolute inset-0">
              <Image
                src="/blossom-login.jpg"
                alt="Blossom Institute platform"
                fill
                priority
                className="object-cover"
              />
            </div>

            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,24,40,0.04)_0%,rgba(20,24,40,0.14)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_20%),radial-gradient(circle_at_bottom_left,rgba(36,59,123,0.16),transparent_28%)]" />
          </section>
        </div>
      </div>
    </div>
  )
}