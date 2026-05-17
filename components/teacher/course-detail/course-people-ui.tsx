import type { ReactNode } from 'react'
import { Mail } from 'lucide-react'

type Tone = 'student' | 'teacher'

const toneClasses: Record<Tone, string> = {
  student: 'border-primary/15 bg-primary/10 text-primary',
  teacher:
    'border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300',
}

export function getPersonInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function PersonAvatar({
  name,
  tone,
}: {
  name: string
  tone: Tone
}) {
  return (
    <div
      className={`flex size-10 shrink-0 items-center justify-center rounded-lg border text-sm font-semibold ${toneClasses[tone]}`}
    >
      {getPersonInitials(name) || '?'}
    </div>
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
