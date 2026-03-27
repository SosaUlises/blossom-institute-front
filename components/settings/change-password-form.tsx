'use client'

import { useState } from 'react'
import { Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { changeMyPassword } from '@/lib/settings/api'

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
          className="pr-11"
          autoComplete="off"
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1 h-8 w-8 rounded-lg text-muted-foreground hover:bg-primary/5 hover:text-primary"
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
    <Card className="border-border/70 bg-card/95 shadow-[0_18px_40px_-22px_rgba(30,42,68,0.20)]">
      <CardHeader className="space-y-2">
        <CardTitle className="text-lg font-semibold tracking-tight">
          Seguridad
        </CardTitle>
        <CardDescription>
          Cambiá tu contraseña de acceso.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
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
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-success/20 bg-success/5 p-3 text-sm text-success">
              {success}
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 rounded-xl bg-primary/90 text-primary-foreground shadow-sm transition-all hover:bg-primary hover:shadow-md hover:-translate-y-[1px]"
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