'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Settings,
  LogOut,
  BarChart3,
} from 'lucide-react'

import { UserRound } from 'lucide-react'

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
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { SessionUser } from '@/lib/auth/session'
import { cn } from '@/lib/utils'

const mainNavItems = [
  { title: 'Dashboard', url: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Students', url: '/admin/dashboard/students', icon: Users },
  { title: 'Teachers', url: '/admin/dashboard/teachers', icon: GraduationCap },
  { title: 'Courses', url: '/admin/dashboard/courses', icon: BookOpen },
  { title: 'Reports', url: '/admin/dashboard/reports', icon: BarChart3 },
]

const settingsNavItems = [
  { title: 'Settings', url: '/admin/dashboard/settings', icon: Settings },
]

interface AppSidebarProps {
  user: SessionUser
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fullName = `${user.nombre} ${user.apellido}`.trim()
  const initials = `${user.nombre?.charAt(0) ?? ''}${user.apellido?.charAt(0) ?? ''}`.toUpperCase()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })

    router.replace('/login')
    router.refresh()
  }

  return (
    <Sidebar className="border-r border-sidebar-border/70 bg-sidebar/92 text-sidebar-foreground backdrop-blur-2xl">
   <SidebarHeader className="border-b border-sidebar-border/70 px-4 py-5">
  <Link
    href="/admin/dashboard"
    className="flex flex-col items-center justify-center text-center"
  >
    <p className="text-[1rem] font-semibold tracking-tight text-foreground">
      Blossom Institute
    </p>
    <p className="text-xs text-muted-foreground">
      Academic Management
    </p>
  </Link>
</SidebarHeader>

      <SidebarContent className="flex h-full flex-col px-3 py-4">
        <div className="flex min-h-0 flex-1 flex-col justify-between">
          <div className="space-y-5">
            <SidebarGroup>
              <SidebarGroupLabel className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">
                Main
              </SidebarGroupLabel>

              <SidebarGroupContent>
                <SidebarMenu className="space-y-1.5">
                  {mainNavItems.map((item) => {
                    const isActive =
                      pathname === item.url ||
                      (item.url !== '/admin/dashboard' && pathname.startsWith(item.url))

                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          tooltip={item.title}
                          className={cn(
                            'h-11 rounded-2xl px-3 text-sm font-medium transition-all duration-200',
                            isActive
                              ? 'border border-primary/20 bg-primary/14 text-foreground shadow-[0_14px_28px_-18px_rgba(36,59,123,0.24)] hover:bg-primary/16 dark:bg-primary/16 dark:text-foreground'
                              : 'border border-transparent text-sidebar-foreground/85 hover:border-sidebar-border/60 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground'
                          )}
                        >
                          <Link href={item.url} className="flex items-center gap-3">
                            <item.icon
                              className={cn(
                                'size-4 shrink-0 transition-colors duration-200',
                                isActive
                                  ? 'text-primary'
                                  : 'text-muted-foreground'
                              )}
                            />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator className="bg-sidebar-border/70" />

            <SidebarGroup>
              <SidebarGroupLabel className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">
                System
              </SidebarGroupLabel>

              <SidebarGroupContent>
                <SidebarMenu className="space-y-1.5">
                  {settingsNavItems.map((item) => {
                    const isActive = pathname.startsWith(item.url)

                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          tooltip={item.title}
                          className={cn(
                            'h-11 rounded-2xl px-3 text-sm font-medium transition-all duration-200',
                            isActive
                              ? 'border border-primary/20 bg-primary/14 text-foreground shadow-[0_14px_28px_-18px_rgba(36,59,123,0.24)] hover:bg-primary/16 dark:bg-primary/16 dark:text-foreground'
                              : 'border border-transparent text-sidebar-foreground/85 hover:border-sidebar-border/60 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground'
                          )}
                        >
                          <Link href={item.url} className="flex items-center gap-3">
                            <item.icon
                              className={cn(
                                'size-4 shrink-0 transition-colors duration-200',
                                isActive
                                  ? 'text-primary'
                                  : 'text-muted-foreground'
                              )}
                            />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>

          <div className="pt-5">
            {!mounted ? (
              <div className="flex w-full items-center gap-3 rounded-2xl border border-sidebar-border/70 bg-card/80 px-3 py-3 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.18)]">
                <Avatar className="size-10 ring-1 ring-primary/10">
                  <AvatarImage src="/avatars/admin.jpg" alt={fullName} />
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>

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
                    className="flex w-full items-center gap-3 rounded-2xl border border-sidebar-border/70 bg-card/82 px-3 py-3 text-left shadow-[0_10px_22px_-18px_rgba(15,23,42,0.18)] transition-all duration-200 hover:border-primary/15 hover:bg-sidebar-accent/70"
                                    >
                  <Avatar className="size-10 border border-border/60 bg-background ring-1 ring-primary/10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <UserRound className="size-4.5" />
                    </AvatarFallback>
                  </Avatar>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {fullName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="start"
                  side="top"
                  className="w-64 rounded-2xl border border-border/70 bg-popover/95 p-2 shadow-[0_22px_50px_-24px_rgba(15,23,42,0.30)] backdrop-blur-xl"
                >
                  <div className="mb-2 rounded-xl bg-muted/35 px-3 py-2.5">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {fullName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-primary">
                      {user.roles.join(', ')}
                    </p>
                  </div>

                  <DropdownMenuSeparator className="my-2 bg-border" />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="rounded-xl px-3 py-2 text-sm text-red-600 transition-colors focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
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