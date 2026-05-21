'use client'

import { useEffect, useMemo, useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export function getUserInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function UserAvatar({
  name,
  avatarUrl,
  size,
  className,
  fallbackClassName,
}: {
  name: string
  avatarUrl?: string | null
  size: number
  className?: string
  fallbackClassName?: string
}) {
  const normalizedAvatarUrl = useMemo(() => avatarUrl?.trim() || null, [avatarUrl])
  const altText = name.trim() || 'Foto de perfil'
  const [hasImageError, setHasImageError] = useState(false)

  useEffect(() => {
    setHasImageError(false)
  }, [normalizedAvatarUrl])

  return (
    <Avatar
      className={cn(
        'border border-border/60 bg-muted ring-1 ring-border/40',
        className,
      )}
      style={{ width: size, height: size }}
    >
      {normalizedAvatarUrl && !hasImageError ? (
        <AvatarImage
          src={normalizedAvatarUrl}
          alt={altText}
          className="object-cover"
          onError={() => setHasImageError(true)}
        />
      ) : null}
      <AvatarFallback className={cn('text-sm font-semibold', fallbackClassName)}>
        {getUserInitials(name) || '?'}
      </AvatarFallback>
    </Avatar>
  )
}
