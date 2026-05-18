import type { ComponentType, ReactNode } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function RoleChipList({ roles }: { roles: string[] }) {
  return (
    <>
      {roles.map((role) => (
        <span
          key={role}
          className="inline-flex max-w-full items-center rounded-full border border-primary/15 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary"
        >
          {role}
        </span>
      ))}
    </>
  )
}

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
    <Card className="min-w-0 rounded-2xl border border-border/60 bg-card/95 shadow-[0_1px_2px_rgba(15,23,42,0.035)] dark:border-border/70">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>

          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
              {title}
            </CardTitle>
            <CardDescription className="text-sm leading-6 text-muted-foreground">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>{children}</CardContent>
    </Card>
  )
}
