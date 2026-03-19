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
  ClipboardList,
  Settings,
  LogOut,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Students',
    url: '/dashboard/students',
    icon: Users,
  },
  {
    title: 'Teachers',
    url: '/dashboard/teachers',
    icon: GraduationCap,
  },
  {
    title: 'Courses',
    url: '/dashboard/courses',
    icon: BookOpen,
  },
  {
    title: 'Assignments',
    url: '/dashboard/assignments',
    icon: ClipboardList,
  },
]

const settingsNavItems = [
  {
    title: 'Settings',
    url: '/dashboard/settings',
    icon: Settings,
  },
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
    <Sidebar className="border-r border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <SidebarHeader className="border-b border-slate-200/80 px-4 py-4">
        <Link href="/dashboard" className="group flex items-center gap-3 rounded-2xl transition">
          <div className="overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm">
            <Image
              src="/logo-blossom.png"
              alt="Blossom Institute"
              width={44}
              height={44}
              className="h-11 w-11 object-cover"
              priority
            />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-slate-900">
              Blossom Institute
            </p>
            <p className="truncate text-xs text-slate-500">
              Admin panel
            </p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Main
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainNavItems.map((item) => {
                const isActive =
                  pathname === item.url ||
                  (item.url !== '/dashboard' && pathname.startsWith(item.url))

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={cn(
                        'h-11 rounded-xl px-3 text-sm font-medium transition',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-[0_10px_30px_-12px_rgba(36,59,123,0.55)] hover:bg-primary'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      )}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon
                          className={cn(
                            'size-4 shrink-0',
                            isActive ? 'text-primary-foreground' : 'text-slate-500'
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

        <SidebarSeparator className="my-4 bg-slate-200/80" />

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            System
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {settingsNavItems.map((item) => {
                const isActive = pathname.startsWith(item.url)

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={cn(
                        'h-11 rounded-xl px-3 text-sm font-medium transition',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-[0_10px_30px_-12px_rgba(36,59,123,0.55)] hover:bg-primary'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      )}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon
                          className={cn(
                            'size-4 shrink-0',
                            isActive ? 'text-primary-foreground' : 'text-slate-500'
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
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200/80 p-3">
        {!mounted ? (
          <div className="flex w-full items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-3 py-3 shadow-sm">
            <Avatar className="size-10 ring-1 ring-primary/10">
              <AvatarImage src="/avatars/admin.jpg" alt={fullName} />
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {fullName}
              </p>
              <p className="truncate text-xs text-slate-500">
                {user.email}
              </p>
            </div>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-3 py-3 text-left shadow-sm transition hover:bg-slate-50"
              >
                <Avatar className="size-10 ring-1 ring-primary/10">
                  <AvatarImage src="/avatars/admin.jpg" alt={fullName} />
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {fullName}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {user.email}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="start"
              side="top"
              className="w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.25)]"
            >
              <div className="mb-2 rounded-xl bg-slate-50 px-3 py-2">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {fullName}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {user.email}
                </p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-primary">
                  {user.roles.join(', ')}
                </p>
              </div>

              <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-sm">
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 size-4" />
                  Settings
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-2 bg-slate-200" />

              <DropdownMenuItem
                onClick={handleLogout}
                className="rounded-xl px-3 py-2 text-sm text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 size-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}