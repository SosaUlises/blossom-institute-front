'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  BookOpen,
  Settings,
  LogOut,
  UserRound,
  ChevronRight,
  Sparkles,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { SessionUser } from '@/lib/auth/session'
import { cn } from '@/lib/utils'

const teacherNavItems = [
  { title: 'Dashboard', url: '/teacher/dashboard', icon: LayoutDashboard },
  { title: 'Courses', url: '/teacher/courses', icon: BookOpen },
  { title: 'Settings', url: '/teacher/settings', icon: Settings },
]

function getItemDescription(title: string) {
  switch (title) {
    case 'Dashboard':
      return 'Resumen general'
    case 'Courses':
      return 'Cursos asignados'
    case 'Settings':
      return 'Configuración'
    default:
      return ''
  }
}

function NavItem({
  item,
  pathname,
}: {
  item: {
    title: string
    url: string
    icon: React.ComponentType<{ className?: string }>
  }
  pathname: string
}) {
  const isActive =
    pathname === item.url ||
    (item.url !== '/teacher/dashboard' && pathname.startsWith(item.url))

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip={item.title} className="h-auto rounded-[22px] p-0 transition-none">
        <Link
          href={item.url}
          className={cn(
            'group flex min-h-[52px] w-full items-center gap-3 rounded-[22px] border px-3 py-3 text-sm font-medium transition-all duration-200',
            isActive
              ? 'border-primary/15 bg-primary/8 text-foreground shadow-[0_16px_28px_-18px_rgba(36,59,123,0.28)] hover:bg-primary/10'
              : 'border-transparent bg-transparent text-sidebar-foreground/85 hover:border-sidebar-border/50 hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground',
          )}
        >
          <div
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-2xl border transition-all duration-200',
              isActive
                ? 'border-primary/15 bg-primary/10 text-primary'
                : 'border-border/50 bg-background/60 text-muted-foreground group-hover:border-primary/10 group-hover:bg-primary/5 group-hover:text-primary/80',
            )}
          >
            <item.icon className="size-4.5" />
          </div>

          <div className="min-w-0 flex-1">
            <p
              className={cn(
                'truncate text-sm font-semibold leading-tight',
                isActive ? 'text-foreground' : 'text-sidebar-foreground/90',
              )}
            >
              {item.title}
            </p>

            <p className="mt-1 truncate text-[11px] leading-[1.25] text-muted-foreground">
              {getItemDescription(item.title)}
            </p>
          </div>

          <ChevronRight
            className={cn(
              'size-4 shrink-0 transition-all duration-200',
              isActive
                ? 'translate-x-0 text-primary'
                : 'text-muted-foreground/70 group-hover:translate-x-0.5 group-hover:text-muted-foreground',
            )}
          />
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function TeacherSidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fullName = `${user.nombre} ${user.apellido}`.trim()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })

    router.replace('/login')
    router.refresh()
  }

  return (
    <Sidebar className="border-r border-sidebar-border/70 bg-sidebar/95 text-sidebar-foreground backdrop-blur-2xl">
      <SidebarHeader className="border-b border-sidebar-border/70 px-4 py-4">
        <Link
          href="/teacher/dashboard"
          className="flex items-center gap-3 rounded-2xl px-1 py-1 transition-all duration-200 hover:opacity-90"
        >
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="size-4.5" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[0.98rem] font-semibold tracking-tight text-foreground">
              Blossom Institute
            </p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              Teacher Panel
            </p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="flex h-full flex-col px-3 py-4">
        <div className="flex min-h-0 flex-1 flex-col justify-between">
          <div className="space-y-5">
            <SidebarGroup>
              <SidebarGroupLabel className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">
                Teaching
              </SidebarGroupLabel>

              <SidebarGroupContent>
                <SidebarMenu className="space-y-2">
                  {teacherNavItems.map((item) => (
                    <NavItem key={item.title} item={item} pathname={pathname} />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>

          <div className="pt-5">
            {!mounted ? (
              <div className="flex w-full items-center gap-3 rounded-[24px] border border-sidebar-border/70 bg-card/85 px-3 py-3 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.18)]">
                <div className="flex size-11 items-center justify-center rounded-2xl border border-border/60 bg-primary/10 text-primary ring-1 ring-primary/10">
                  <UserRound className="size-4.5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {fullName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="group flex w-full items-center gap-3 rounded-[24px] border border-sidebar-border/70 bg-card/85 px-3 py-3 text-left shadow-[0_10px_20px_-18px_rgba(15,23,42,0.18)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-sidebar-accent/60 hover:shadow-md"
                  >
                    <div className="flex size-11 items-center justify-center rounded-2xl border border-border/60 bg-primary/10 text-primary ring-1 ring-primary/10 transition-transform duration-200 group-hover:scale-[1.02]">
                      <UserRound className="size-4.5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {fullName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>

                    <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="start"
                  side="top"
                  className="w-64 rounded-2xl border border-border/70 bg-popover/95 p-2 shadow-[0_22px_50px_-24px_rgba(15,23,42,0.30)] backdrop-blur-xl"
                >
                  <div className="mb-2 rounded-[18px] border border-border/60 bg-muted/35 px-3 py-3">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {fullName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="mt-2 inline-flex rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                      {user.roles.join(', ')}
                    </p>
                  </div>

                  <DropdownMenuSeparator className="my-2 bg-border" />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="rounded-xl px-3 py-2 text-sm text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400 hover:bg-red-50 focus:bg-red-50 data-[state=open]:bg-red-50"
                  >
                    <LogOut className="mr-2 size-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}