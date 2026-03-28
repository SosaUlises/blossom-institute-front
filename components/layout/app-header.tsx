'use client'

import { useEffect, useState } from 'react'
import { Moon, Sparkles, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface AppHeaderProps {
  title: string
}

export function AppHeader({ title }: AppHeaderProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-[74px] items-center border-b border-border/70 bg-background/75 px-6 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/65">
      <div className="flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-2xl border border-border/70 bg-card/80 shadow-[0_10px_30px_-18px_rgba(30,42,68,0.28)]">
          <SidebarTrigger className="text-muted-foreground transition hover:text-foreground" />
        </div>

        <Separator orientation="vertical" className="h-6 bg-border/80" />

        <div className="space-y-0.5">
          <h1 className="text-[1.35rem] font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-primary/80" />
            <span>Blossom Institute · Panel administrativo</span>
          </div>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme('light')}
          className={cn(
            'rounded-2xl border border-transparent text-muted-foreground transition-all hover:border-border/70 hover:bg-card/80 hover:text-foreground',
            mounted && theme === 'light' && 'border-border/70 bg-card/90 text-foreground shadow-sm'
          )}
        >
          <Sun className="size-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme('dark')}
          className={cn(
            'rounded-2xl border border-transparent text-muted-foreground transition-all hover:border-border/70 hover:bg-card/80 hover:text-foreground',
            mounted && theme === 'dark' && 'border-border/70 bg-card/90 text-foreground shadow-sm'
          )}
        >
          <Moon className="size-4" />
        </Button>
      </div>
    </header>
  )
}