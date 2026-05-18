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
              <div className="mb-8 [@media(max-height:760px)]:mb-5">
                <div className="mb-6 [@media(max-height:760px)]:mb-4">
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
                    Iniciar sesión
                  </p>
                  <h1 className="text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-[2rem]">
                    Bienvenido
                  </h1>

                  <p className="mt-2.5 max-w-md text-sm leading-6 text-muted-foreground">
                    Accedé a tu espacio académico para continuar.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <FieldGroup className="gap-5 [@media(max-height:760px)]:gap-4">
                  {error && (
                    <Alert className="rounded-xl border-destructive/25 bg-destructive/5 py-3 text-destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Field>
                    <FieldLabel
                      htmlFor="email"
                      className="mb-1.5 text-sm font-semibold text-foreground"
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
                      className="h-11 rounded-xl border-border/60 bg-background/75 px-3 text-sm text-foreground shadow-none placeholder:text-muted-foreground/80 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary/15"
                    />
                  </Field>

                  <Field>
                    <FieldLabel
                      htmlFor="password"
                      className="mb-1.5 text-sm font-semibold text-foreground"
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
                        className="h-11 rounded-xl border-border/60 bg-background/75 px-3 pr-11 text-sm text-foreground shadow-none placeholder:text-muted-foreground/80 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary/15"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-9 w-9 rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-primary/8 hover:text-primary"
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

                  <div className="flex items-center justify-between gap-4">
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
                    className="text-sm font-medium text-primary transition-colors duration-200 hover:text-primary/80"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-none transition-colors duration-200 hover:bg-primary/90"
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

          <section className="relative hidden min-h-0 lg:block">
            <div className="absolute inset-0">
              <Image
                src="/blossom-login.jpg"
                alt="Blossom Institute platform"
                fill
                priority
                className="object-cover"
              />
            </div>

          </section>
        </div>
      </div>
    </div>
  )
}
