'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Flower2, Loader2 } from 'lucide-react'

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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground mb-4">
            <Flower2 className="size-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Blossom Institute</h1>
          <p className="text-muted-foreground text-sm mt-1">Educational Management System</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Bienvenido</CardTitle>
            <CardDescription>
              Iniciá sesión para continuar
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@sosa.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">Contraseña</FieldLabel>

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
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4 text-muted-foreground" />
                      ) : (
                        <Eye className="size-4 text-muted-foreground" />
                      )}
                      <span className="sr-only">
                        {showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      </span>
                    </Button>
                  </div>
                </Field>

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
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    Recordarme
                  </label>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
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

            <div className="mt-6 text-center text-sm">
              <Link href="/forgot-password" className="text-primary hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}