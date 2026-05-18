'use client'

import { useState } from 'react'
import { Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SettingsSection } from '@/components/teacher/settings/settings-ui'
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
          className="h-10 rounded-xl border-border/60 bg-background/75 pr-11 shadow-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35"
          autoComplete="off"
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1 h-8 w-8 rounded-lg text-muted-foreground transition hover:bg-primary/5 hover:text-primary"
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
    <SettingsSection
      icon={ShieldCheck}
      title="Seguridad"
      description="Actualizá tu contraseña para mantener tu cuenta protegida."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
            label="Repetir nueva contraseña"
            value={formData.confirmNewPassword}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, confirmNewPassword: value }))
            }
            show={showConfirm}
            onToggle={() => setShowConfirm((prev) => !prev)}
            placeholder="Repetí tu nueva contraseña"
          />

          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-green-500/20 bg-green-500/5 px-3 py-2.5 text-sm text-green-700 dark:text-green-400">
              {success}
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 rounded-xl px-4 shadow-none transition-colors duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <KeyRound className="mr-2 size-4" />
                  Actualizar contraseña
                </>
              )}
            </Button>
          </div>
      </form>
    </SettingsSection>
  )
}
