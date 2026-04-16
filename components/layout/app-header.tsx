'use client'

import { PanelLeft, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import { useTheme } from 'next-themes'

type AppHeaderProps = {
  title: string
}

export function AppHeader({ title }: AppHeaderProps) {
  const { toggleSidebar } = useSidebar()
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSidebar}
            className="size-11 shrink-0 rounded-2xl border-border/70 bg-background/85 shadow-sm hover:bg-muted hover:text-foreground "
          >
            <PanelLeft className="size-4.5" />
          </Button>

          <div className="min-w-0">
            <h1 className="truncate text-[1.05rem] font-semibold tracking-tight text-foreground sm:text-[1.55rem]">
              {title}
            </h1>
            <p className="truncate text-xs text-muted-foreground sm:text-sm">
              Blossom Institute · Panel administrativo
            </p>
          </div>
        </div>

      <div className="flex shrink-0 items-center gap-2">
  <Button
    variant="outline"
    size="icon"
    className="size-11 rounded-2xl border-border/70 bg-background/85 shadow-sm transition-colors hover:bg-muted hover:text-foreground"
    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
  >
    <Sun className="size-4.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
    <Moon className="absolute size-4.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
  </Button>
</div>
      </div>
    </header>
  )
}