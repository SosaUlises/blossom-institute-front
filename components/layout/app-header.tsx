'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
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
    <header className="sticky top-0 z-30 flex h-[74px] items-center border-b border-border/60 bg-background/75 px-6 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/65">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl border border-border/60 bg-card/80 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.22)]">
          <SidebarTrigger className="text-muted-foreground transition-all duration-200 hover:text-foreground" />
        </div>

        <Separator orientation="vertical" className="h-6 bg-border/70" />

        <div className="space-y-0.5">
          <h1 className="text-[1.35rem] font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-xs text-muted-foreground">
            Blossom Institute · Panel administrativo
          </p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme('light')}
          className={cn(
            'rounded-2xl border border-transparent text-muted-foreground transition-all duration-200 hover:border-border/60 hover:bg-card/80 hover:text-foreground',
            mounted && theme === 'light' && 'border-border/60 bg-card/90 text-foreground shadow-sm'
          )}
        >
          <Sun className="size-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme('dark')}
          className={cn(
            'rounded-2xl border border-transparent text-muted-foreground transition-all duration-200 hover:border-border/60 hover:bg-card/80 hover:text-foreground',
            mounted && theme === 'dark' && 'border-border/60 bg-card/90 text-foreground shadow-sm'
          )}
        >
          <Moon className="size-4" />
        </Button>
      </div>
    </header>
  )
}