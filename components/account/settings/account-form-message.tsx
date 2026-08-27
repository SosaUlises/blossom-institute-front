import type { ReactNode } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

import { cn } from '@/lib/utils'

type AccountFormMessageProps = {
  children: ReactNode
  className?: string
  variant: 'error' | 'success'
}

export function AccountFormMessage({
  children,
  className,
  variant,
}: AccountFormMessageProps) {
  const isError = variant === 'error'
  const Icon = isError ? AlertCircle : CheckCircle2

  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm',
        isError
          ? 'border-destructive/20 bg-destructive/5 text-destructive dark:bg-destructive/10'
          : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <p className="min-w-0 leading-5">{children}</p>
    </div>
  )
}
