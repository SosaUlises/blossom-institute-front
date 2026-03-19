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
  const { setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur">

      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-4" />
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => setTheme('light')}>
          <Sun className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setTheme('dark')}>
          <Moon className="size-4" />
        </Button>
      </div>
    </header>
  )
}