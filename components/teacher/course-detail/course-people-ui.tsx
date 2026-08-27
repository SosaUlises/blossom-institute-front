import type { ReactNode } from 'react'
import { Mail } from 'lucide-react'

import { UserAvatar, getUserInitials } from '@/components/shared/user-avatar'

type Tone = 'student' | 'teacher'

const toneClasses: Record<Tone, string> = {
  student: 'bg-primary/10 text-primary',
  teacher:
    'bg-violet-500/10 text-violet-700 dark:text-violet-300',
}

export const getPersonInitials = getUserInitials

export function PersonAvatar({
  name,
  avatarUrl,
  tone,
  size = 40,
}: {
  name: string
  avatarUrl?: string | null
  tone: Tone
  size?: number
}) {
  return (
    <UserAvatar
      name={name}
      avatarUrl={avatarUrl}
      size={size}
      className="shrink-0"
      fallbackClassName={toneClasses[tone]}
    />
  )
}

export function PersonMeta({ email }: { email?: string | null }) {
  return (
    <div className="mt-1 flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
      <Mail className="size-3.5 shrink-0" />
      <span className="truncate" title={email ?? 'Sin email registrado'}>
        {email ?? 'Sin email registrado'}
      </span>
    </div>
  )
}

export function CoursePeopleSection({
  children,
  variant = 'rows',
}: {
  children: ReactNode
  variant?: 'rows' | 'grid'
}) {
  return <div className={variant === 'grid' ? 'grid gap-2 md:grid-cols-2' : 'space-y-2'}>{children}</div>
}

export function PersonRosterSurface({
  children,
  tone,
}: {
  children: ReactNode
  tone: Tone
}) {
  const surfaceClass =
    tone === 'student'
      ? 'bg-background/60 hover:border-primary/20 dark:bg-background/40'
      : 'bg-background/55 hover:border-primary/15 dark:bg-background/35'

  return (
    <article
      className={`rounded-xl border border-border/60 px-3 py-3 transition-colors duration-200 hover:bg-card focus-within:border-primary/25 active:bg-card sm:px-4 ${surfaceClass}`}
    >
      {children}
    </article>
  )
}
