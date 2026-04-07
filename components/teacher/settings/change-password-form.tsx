'use client'

import { useState } from 'react'
import { Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { changeMyPassword } from '@/lib/teacher/settings/api'

type PasswordFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  show: boolean
  onToggle: () => void
  placeholder: string
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
  placeholder,
}: PasswordFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>

      <div className="relative">
        <Input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-11 rounded-2xl border-border/70 bg-card/85 pr-12 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.14)] transition-all duration-200 focus-visible:ring-4 focus-visible:ring-primary/15"
          autoComplete="off"
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1.5 top-1.5 h-8 w-8 rounded-xl text-muted-foreground transition hover:bg-primary/5 hover:text-primary"
          onClick={onToggle}
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </Button>
      </div>
    </div>
  )
}

export function ChangePasswordForm() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  })

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      const message = await changeMyPassword(formData)

      setSuccess(message)
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      })
    } catch (err: any) {
      setError(err?.message || 'No se pudo actualizar la contraseña.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="rounded-[28px] border border-border/60 bg-card/95 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="size-5" />
          </div>

          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
              Seguridad
            </CardTitle>
            <CardDescription className="text-sm leading-6 text-muted-foreground">
              Cambiá tu contraseña de acceso y mantené tu cuenta protegida.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <PasswordField
            label="Contraseña actual"
            value={formData.currentPassword}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, currentPassword: value }))
            }
            show={showCurrent}
            onToggle={() => setShowCurrent((prev) => !prev)}
            placeholder="Ingresá tu contraseña actual"
          />

          <PasswordField
            label="Nueva contraseña"
            value={formData.newPassword}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, newPassword: value }))
            }
            show={showNew}
            onToggle={() => setShowNew((prev) => !prev)}
            placeholder="Ingresá tu nueva contraseña"
          />

          <PasswordField
            label="Confirmar nueva contraseña"
            value={formData.confirmNewPassword}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, confirmNewPassword: value }))
            }
            show={showConfirm}
            onToggle={() => setShowConfirm((prev) => !prev)}
            placeholder="Repetí tu nueva contraseña"
          />

          {error && (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-3 text-sm text-green-700 dark:text-green-400">
              {success}
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 rounded-2xl bg-primary px-5 text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg active:translate-y-0 active:shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <KeyRound className="mr-2 size-4" />
                  Cambiar contraseña
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}