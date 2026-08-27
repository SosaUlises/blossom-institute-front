import type { ComponentType, ReactNode } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <Card className="min-w-0 rounded-xl border border-border/60 bg-card/95 shadow-[0_1px_2px_rgba(15,23,42,0.035)] dark:border-border/70 dark:bg-card/90">
      <CardHeader className="p-4 pb-3">
        <div className="flex items-start gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/15">
            <Icon className="size-4" />
          </div>

          <div className="min-w-0 space-y-0.5">
            <CardTitle className="text-base font-semibold tracking-tight text-foreground">
              {title}
            </CardTitle>
            <CardDescription className="text-sm leading-5 text-muted-foreground">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 pt-0">
        {children}
      </CardContent>
    </Card>
  )
}
