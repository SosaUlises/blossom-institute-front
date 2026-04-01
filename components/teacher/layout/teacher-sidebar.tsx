'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  BookOpen,
  Settings,
  LogOut,
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

const teacherNavItems = [
  { title: 'Dashboard', url: '/teacher/dashboard', icon: LayoutDashboard },
  { title: 'Courses', url: '/teacher/courses', icon: BookOpen },
]

const systemNavItems = [
  { title: 'Settings', url: '/teacher/settings', icon: Settings },
]

export function TeacherSidebar({ user }: { user: SessionUser }) {
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
    <Sidebar className="border-r border-sidebar-border/80 bg-sidebar/95 text-sidebar-foreground backdrop-blur-2xl">
      <SidebarHeader className="border-b border-sidebar-border/80 px-4 py-4">
        <Link href="/teacher/dashboard" className="flex items-center gap-3 rounded-2xl">
          <div className="overflow-hidden rounded-2xl border border-primary/10 bg-card shadow-[0_10px_28px_-16px_rgba(36,59,123,0.35)]">
            <Image
              src="/logo-blossom.png"
              alt="Blossom Institute"
              width={48}
              height={48}
              className="h-12 w-12 object-cover"
              priority
            />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-foreground">
              Blossom Institute
            </p>
            <p className="truncate text-xs text-muted-foreground">
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
                <SidebarMenu className="space-y-1.5">
                  {teacherNavItems.map((item) => {
                    const isActive =
                      pathname === item.url || pathname.startsWith(item.url)

                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          tooltip={item.title}
                          className={cn(
                            'h-11 rounded-2xl px-3 text-sm font-medium transition-all',
                            isActive
                              ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_16px_32px_-16px_rgba(36,59,123,0.55)] hover:bg-sidebar-primary'
                              : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                          )}
                        >
                          <Link href={item.url} className="flex items-center gap-3">
                            <item.icon
                              className={cn(
                                'size-4 shrink-0',
                                isActive
                                  ? 'text-sidebar-primary-foreground'
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

            <SidebarSeparator className="bg-sidebar-border/80" />

            <SidebarGroup>
              <SidebarGroupLabel className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">
                System
              </SidebarGroupLabel>

              <SidebarGroupContent>
                <SidebarMenu className="space-y-1.5">
                  {systemNavItems.map((item) => {
                    const isActive = pathname.startsWith(item.url)

                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          tooltip={item.title}
                          className={cn(
                            'h-11 rounded-2xl px-3 text-sm font-medium transition-all',
                            isActive
                              ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_16px_32px_-16px_rgba(36,59,123,0.55)] hover:bg-sidebar-primary'
                              : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                          )}
                        >
                          <Link href={item.url} className="flex items-center gap-3">
                            <item.icon
                              className={cn(
                                'size-4 shrink-0',
                                isActive
                                  ? 'text-sidebar-primary-foreground'
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
              <div className="flex w-full items-center gap-3 rounded-2xl border border-sidebar-border/80 bg-card/80 px-3 py-3 shadow-sm">
                <Avatar className="size-10 ring-1 ring-primary/10">
                  <AvatarImage src="/avatars/teacher.jpg" alt={fullName} />
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{fullName}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-2xl border border-sidebar-border/80 bg-card/85 px-3 py-3 text-left shadow-sm transition-all hover:bg-sidebar-accent/70"
                  >
                    <Avatar className="size-10 ring-1 ring-primary/10">
                      <AvatarImage src="/avatars/teacher.jpg" alt={fullName} />
                      <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{fullName}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="start"
                  side="top"
                  className="w-64 rounded-2xl border border-border/70 bg-popover/95 p-2 shadow-[0_22px_50px_-24px_rgba(15,23,42,0.30)] backdrop-blur-xl"
                >
                  <div className="mb-2 rounded-xl bg-muted/40 px-3 py-2">
                    <p className="truncate text-sm font-semibold text-foreground">{fullName}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-primary">
                      {user.roles.join(', ')}
                    </p>
                  </div>

                  <DropdownMenuSeparator className="my-2 bg-border" />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="rounded-xl px-3 py-2 text-sm text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
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