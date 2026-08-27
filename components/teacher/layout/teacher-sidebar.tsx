'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  BookOpen,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Moon,
  PanelLeft,
  Settings,
  Sun,
  UserCircle,
} from 'lucide-react'
import { useTheme } from 'next-themes'

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
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserAvatar } from '@/components/shared/user-avatar'
import type { SessionUser } from '@/lib/auth/session'
import { CURRENT_USER_AVATAR_UPDATED_EVENT } from '@/lib/auth/client-events'
import { cn } from '@/lib/utils'

const teacherNavItems = [
  {
    title: 'Inicio',
    url: '/teacher/dashboard',
    description: 'Trabajo de hoy',
    icon: LayoutDashboard,
  },
  {
    title: 'Cursos',
    url: '/teacher/courses',
    description: 'Espacios asignados',
    icon: BookOpen,
  },
  {
    title: 'Mi cuenta',
    url: '/teacher/settings',
    description: 'Perfil y seguridad',
    icon: Settings,
  },
]

function SidebarCollapseButton() {
  const { state, toggleSidebar } = useSidebar()
  const isCollapsed = state === 'collapsed'

  return (
    <button
      type="button"
      aria-label={isCollapsed ? 'Expandir navegación' : 'Contraer navegación'}
      title={isCollapsed ? 'Expandir navegación' : 'Contraer navegación'}
      onClick={toggleSidebar}
      className={cn(
        'hidden size-9 shrink-0 items-center justify-center rounded-xl border border-sidebar-border/70 bg-background/65 text-muted-foreground shadow-[0_1px_1px_rgba(15,23,42,0.025)] transition-colors duration-200 hover:border-primary/15 hover:bg-sidebar-accent/60 hover:text-foreground active:scale-[0.98] md:flex dark:bg-background/25',
        isCollapsed && 'mx-auto',
      )}
    >
      <PanelLeft
        className={cn(
          'size-4 transition-transform duration-200',
          isCollapsed && 'rotate-180',
        )}
      />
    </button>
  )
}

function NavItem({
  item,
  pathname,
}: {
  item: (typeof teacherNavItems)[number]
  pathname: string
}) {
  const isActive =
    pathname === item.url ||
    (item.url !== '/teacher/dashboard' && pathname.startsWith(item.url))

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        tooltip={item.title}
        className="h-auto rounded-xl p-0 transition-none group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:p-0!"
      >
        <Link
          href={item.url}
          aria-label={item.title}
          className={cn(
            'group flex min-h-[48px] w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors duration-200 group-data-[collapsible=icon]:min-h-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-0',
            isActive
              ? 'border-primary/15 bg-primary/8 text-foreground shadow-[0_1px_1px_rgba(15,23,42,0.04)] hover:bg-primary/10'
              : 'border-transparent bg-transparent text-sidebar-foreground/85 hover:border-sidebar-border/60 hover:bg-sidebar-accent/45 hover:text-sidebar-accent-foreground',
          )}
        >
          <div
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors duration-200 group-data-[collapsible=icon]:size-8',
              isActive
                ? 'border-primary/15 bg-primary/10 text-primary'
                : 'border-border/50 bg-background/60 text-muted-foreground group-hover:border-primary/10 group-hover:bg-primary/5 group-hover:text-primary/80',
            )}
          >
            <item.icon className="size-4.5" />
          </div>

          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold leading-tight">
              {item.title}
            </p>
            <p className="mt-1 truncate text-[11px] leading-[1.25] text-muted-foreground">
              {item.description}
            </p>
          </div>

          <ChevronRight
            className={cn(
              'size-4 shrink-0 transition-all duration-200 group-data-[collapsible=icon]:hidden',
              isActive
                ? 'text-primary'
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
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    fetch('/api/auth/me', {
      credentials: 'include',
      cache: 'no-store',
    })
      .then(async (response) => {
        if (!response.ok) return null
        const result = (await response.json()) as { data?: SessionUser }
        return result.data ?? null
      })
      .then((currentUser) => setAvatarUrl(currentUser?.avatarUrl ?? null))
      .catch(() => setAvatarUrl(user.avatarUrl ?? null))
  }, [user.avatarUrl])

  useEffect(() => {
    const handleAvatarUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ avatarUrl: string | null }>).detail
      setAvatarUrl(detail?.avatarUrl ?? null)
    }

    window.addEventListener(CURRENT_USER_AVATAR_UPDATED_EVENT, handleAvatarUpdated)
    return () =>
      window.removeEventListener(
        CURRENT_USER_AVATAR_UPDATED_EVENT,
        handleAvatarUpdated,
      )
  }, [])

  const fullName = `${user.nombre} ${user.apellido}`.trim()
  const isDark = mounted && resolvedTheme === 'dark'
  const ThemeIcon = isDark ? Moon : Sun
  const themeLabel = isDark ? 'Modo oscuro' : 'Modo claro'

  const handleLogout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
    router.replace('/login')
    router.refresh()
  }

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border/70 bg-sidebar/95 text-sidebar-foreground backdrop-blur-2xl"
    >
      <SidebarHeader className="border-b border-sidebar-border/70 px-4 py-4 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-3">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:flex-col">
          <Link
            href="/teacher/dashboard"
            aria-label="Blossom Institute"
            className="group flex min-w-0 flex-1 items-center justify-center rounded-xl px-2 py-2 transition-colors duration-200 hover:bg-sidebar-accent/40 group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:flex-none group-data-[collapsible=icon]:p-0"
          >
            <div className="flex h-[52px] w-full items-center justify-center overflow-hidden rounded-xl px-3 group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:p-0">
              <Image
                src="/blossom-logo.png"
                alt="Blossom Institute"
                width={180}
                height={54}
                className="h-auto max-h-[52px] w-auto object-contain group-data-[collapsible=icon]:hidden"
                priority
              />
              <Image
                src="/blossom-bridge-isotype.png"
                alt=""
                width={36}
                height={36}
                className="hidden size-8 object-contain group-data-[collapsible=icon]:block"
              />
            </div>
          </Link>
          <SidebarCollapseButton />
        </div>
      </SidebarHeader>

      <SidebarContent className="flex h-full flex-col px-3 py-4 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-1.5">
        <div className="flex min-h-0 flex-1 flex-col justify-between group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:items-center">
          <SidebarGroup className="w-full p-0 group-data-[collapsible=icon]:items-center">
            <SidebarGroupLabel className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">
              Docencia
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:space-y-1.5">
                {teacherNavItems.map((item) => (
                  <NavItem key={item.title} item={item} pathname={pathname} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <div className="w-full pt-3 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:pt-2">
            {!mounted ? (
              <div className="flex w-full items-center gap-2.5 rounded-xl border border-sidebar-border/60 bg-background/45 px-2 py-2 dark:bg-background/20 group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0">
                <UserAvatar
                  name={fullName}
                  avatarUrl={avatarUrl}
                  size={34}
                  fallbackClassName="bg-primary/10 text-primary"
                />
                <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                  <p className="truncate text-sm font-semibold leading-none text-foreground">
                    {fullName}
                  </p>
                  <p className="mt-1 break-all text-[11px] leading-4 text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Abrir menú de usuario"
                    title="Usuario"
                    className="group flex w-full items-center gap-2.5 rounded-xl border border-sidebar-border/60 bg-background/45 px-2 py-2 text-left transition-colors duration-200 hover:border-primary/15 hover:bg-sidebar-accent/55 active:scale-[0.99] dark:bg-background/20 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0"
                  >
                    <UserAvatar
                      name={fullName}
                      avatarUrl={avatarUrl}
                      size={34}
                      className="transition-transform duration-200 group-hover:scale-[1.02]"
                      fallbackClassName="bg-primary/10 text-primary"
                    />
                    <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                      <p className="truncate text-sm font-semibold leading-none text-foreground">
                        {fullName}
                      </p>
                      <p className="mt-1 break-all text-[11px] leading-4 text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="start"
                  side="top"
                  className="w-56 rounded-2xl border border-border/70 bg-popover/95 p-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.035)] backdrop-blur-xl"
                >
                  <DropdownMenuItem
                    onSelect={() => router.push('/teacher/settings')}
                    className="rounded-xl px-3 py-2 text-sm"
                  >
                    <UserCircle className="mr-2 size-4" />
                    Mi cuenta
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={(event) => {
                      event.preventDefault()
                      setTheme(isDark ? 'light' : 'dark')
                    }}
                    className="rounded-xl px-3 py-2 text-sm"
                  >
                    <ThemeIcon className="mr-2 size-4" />
                    <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
                      <span>Apariencia</span>
                      <span className="text-xs text-muted-foreground">{themeLabel}</span>
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1.5 bg-border" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="rounded-xl px-3 py-2 text-sm text-red-600 focus:bg-red-50 focus:text-red-600 dark:text-red-400 dark:focus:bg-red-500/10 dark:focus:text-red-300"
                  >
                    <LogOut className="mr-2 size-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
