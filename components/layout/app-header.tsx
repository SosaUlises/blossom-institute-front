'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface AppHeaderProps {
  title: string
}

export function AppHeader({ title }: AppHeaderProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center border-b border-slate-200/70 bg-white/80 px-6 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-slate-200/80 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <SidebarTrigger className="text-slate-600 dark:text-slate-300" />
        </div>

        <Separator orientation="vertical" className="h-5 bg-slate-200 dark:bg-slate-800" />

        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Blossom Institute · Panel administrativo
          </p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme('light')}
          className={
            theme === 'light'
              ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
              : 'text-slate-500 dark:text-slate-400'
          }
        >
          <Sun className="size-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme('dark')}
          className={
            theme === 'dark'
              ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
              : 'text-slate-500 dark:text-slate-400'
          }
        >
          <Moon className="size-4" />
        </Button>
      </div>
    </header>
  )
}