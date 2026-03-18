'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'

import { loginRequest } from '@/lib/auth/api'
import { setAuthSession, isAuthenticated } from '@/lib/auth/storage'

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
    if (isAuthenticated()) {
      router.replace('/dashboard')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await loginRequest({
        email: formData.email.trim(),
        password: formData.password,
      })

      setAuthSession(result.data.token, result.data.usuario)
      router.replace('/dashboard')
    } catch (err: any) {
      if (err?.statusCode === 400) {
        setError('Revisá los datos ingresados.')
      } else if (err?.statusCode === 401) {
        setError('Usuario o contraseña incorrectos.')
      } else if (err?.statusCode === 403) {
        setError('Tu usuario está inactivo o no tiene permisos.')
      } else if (err?.statusCode === 423) {
        setError('Tu cuenta está bloqueada temporalmente. Intentá más tarde.')
      } else {
        setError(err?.message || 'Ocurrió un error al iniciar sesión.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
       <div className="relative hidden min-h-screen overflow-hidden lg:flex">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/bigben.jpg')" }}
            />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(198,61,79,0.08),transparent_30%)]" />

            <div className="relative z-10 flex h-full w-full items-end px-16 py-16">
              <div className="max-w-lg space-y-4">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-white/65">
                  Blossom Institute
                </p>
                <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white">
                  Tu espacio dentro de Blossom
                </h1>
                <p className="max-w-md text-base leading-7 text-white/78">
                  Accedé a una experiencia académica más clara y cercana, diseñada para acompañar el aprendizaje y la organización de toda la comunidad educativa.
                </p>
              </div>
            </div>
        </div>

        <div className="flex min-h-screen items-center justify-center px-6 py-10 bg-[#f7f8fc] bg-slate-50">
          <div className="w-full max-w-md">
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="overflow-hidden rounded-full border border-primary/10 bg-white shadow-lg shadow-primary/5">
                <Image
                  src="/logo-blossom.png"
                  alt="Blossom Institute"
                  width={96}
                  height={96}
                  className="h-35 w-35 object-cover"
                  priority
                />
              </div>

              <p className="mt-5 text-sm text-muted-foreground">
                Iniciá sesión para acceder al panel administrativo
              </p>
            </div>

          <Card className="border border-slate-200/80 bg-white/95 shadow-[0_30px_80px_-20px_rgba(30,42,68,0.35)] backdrop-blur-md">
              <CardHeader className="space-y-2 pb-4 text-center">
                <CardTitle className="text-2xl font-bold text-foreground">
                  Bienvenido
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Ingresá tus credenciales para continuar
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit}>
                  <FieldGroup className="space-y-5">
                    {error && (
                      <Alert variant="destructive" className="border-destructive/20">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Field>
                      <FieldLabel htmlFor="email" className="text-sm font-semibold text-foreground">
                        Email
                      </FieldLabel>
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        disabled={isLoading}
                        autoComplete="email"
                        className="h-12 rounded-xl border-border/70 bg-background/80 px-4 shadow-sm transition focus-visible:ring-2 focus-visible:ring-primary/30"
                      />
                    </Field>

                    <Field>
                      <div className="flex items-center justify-between">
                        <FieldLabel htmlFor="password" className="text-sm font-semibold text-foreground">
                          Contraseña
                        </FieldLabel>
                      </div>

                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Ingresá tu contraseña"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                          disabled={isLoading}
                          autoComplete="current-password"
                          className="h-12 rounded-xl border-border/70 bg-background/80 px-4 pr-11 shadow-sm transition focus-visible:ring-2 focus-visible:ring-primary/30"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1 h-10 w-10 rounded-lg text-muted-foreground hover:bg-primary/5 hover:text-primary"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                          <span className="sr-only">
                            {showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                          </span>
                        </Button>
                      </div>
                    </Field>

                    <div className="flex items-center justify-between gap-4 pt-1">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="remember"
                          checked={formData.rememberMe}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, rememberMe: checked === true })
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
                        className="text-sm font-medium text-primary transition hover:text-accent"
                      >
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>

                    <Button
                      type="submit"
                      className="h-12 w-full rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90"
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}