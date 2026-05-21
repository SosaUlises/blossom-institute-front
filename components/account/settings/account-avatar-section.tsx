'use client'

import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Loader2, Trash2 } from 'lucide-react'

import { UserAvatar } from '@/components/shared/user-avatar'
import { Button } from '@/components/ui/button'
import { emitCurrentUserAvatarUpdated } from '@/lib/auth/client-events'
import {
  deleteMyAvatar,
  getMyAccountSettings,
  updateMyAvatar,
} from '@/lib/account/settings/api'
import type { MyAccountSettings } from '@/lib/account/settings/types'

const ACCEPTED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_AVATAR_SIZE_MB = 5
const MAX_AVATAR_SIZE_BYTES = MAX_AVATAR_SIZE_MB * 1024 * 1024

export function AccountAvatarSection({
  account,
  onUpdated,
}: {
  account: MyAccountSettings
  onUpdated: (updated: MyAccountSettings) => void
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const fullName = `${account.nombre} ${account.apellido}`.trim()
  const avatarUrl = previewUrl ?? account.avatarUrl ?? null

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const validateFile = (files: FileList | null) => {
    if (!files || files.length === 0) return null
    if (files.length > 1) throw new Error('Seleccioná una sola imagen.')

    const file = files[0]

    if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
      throw new Error('El archivo debe ser JPG, PNG o WEBP.')
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      throw new Error(`La imagen no puede superar ${MAX_AVATAR_SIZE_MB} MB.`)
    }

    return file
  }

  const refreshAccount = async () => {
    const updated = await getMyAccountSettings()
    onUpdated(updated)
    emitCurrentUserAvatarUpdated(updated.avatarUrl ?? null)
  }

  const handleFileChange = async (files: FileList | null) => {
    let localPreviewUrl: string | null = null

    try {
      setError(null)
      setSuccess(null)

      const file = validateFile(files)
      if (!file) return

      localPreviewUrl = URL.createObjectURL(file)
      setPreviewUrl(localPreviewUrl)
      setUploading(true)

      await updateMyAvatar(file)
      await refreshAccount()
      URL.revokeObjectURL(localPreviewUrl)
      setPreviewUrl(null)
      setSuccess('Foto de perfil actualizada.')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No pudimos actualizar tu foto.',
      )

      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl)
        setPreviewUrl(null)
      }
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleDelete = async () => {
    try {
      setError(null)
      setSuccess(null)
      setRemoving(true)

      await deleteMyAvatar()
      setPreviewUrl(null)
      await refreshAccount()
      setSuccess('Foto de perfil eliminada.')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No pudimos eliminar tu foto.',
      )
    } finally {
      setRemoving(false)
    }
  }

  return (
    <section className="rounded-xl border border-border/60 bg-background/75 p-3 dark:bg-background/35">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <UserAvatar
            name={fullName}
            avatarUrl={avatarUrl}
            size={64}
            className="shrink-0"
            fallbackClassName="bg-primary/10 text-primary dark:bg-primary/15"
          />

          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground">
              Foto de perfil
            </h3>
            <p className="mt-0.5 text-sm leading-5 text-muted-foreground">
              Usá una imagen cuadrada. JPG, PNG o WEBP.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => void handleFileChange(event.target.files)}
          />

          <Button
            type="button"
            variant="outline"
            disabled={uploading || removing}
            aria-label="Cambiar foto de perfil"
            className="h-10 w-full rounded-xl border-border/60 bg-background/75 shadow-none hover:bg-muted/60 dark:bg-background/35 sm:w-auto"
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <ImagePlus className="mr-2 size-4" />
                Cambiar foto
              </>
            )}
          </Button>

          {account.avatarUrl ? (
            <Button
              type="button"
              variant="outline"
              disabled={uploading || removing}
              aria-label="Eliminar foto de perfil"
              className="h-10 w-full rounded-xl border-border/60 bg-background/75 text-destructive shadow-none hover:bg-destructive/5 hover:text-destructive dark:bg-background/35 sm:w-auto"
              onClick={() => void handleDelete()}
            >
              {removing ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 size-4" />
                  Eliminar foto
                </>
              )}
            </Button>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive dark:bg-destructive/10">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mt-4 rounded-xl border border-green-500/20 bg-green-500/5 px-3 py-2.5 text-sm text-green-700 dark:bg-green-500/10 dark:text-green-400">
          {success}
        </div>
      ) : null}
    </section>
  )
}
