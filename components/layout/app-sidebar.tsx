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
  BarChart3,
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
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Students', url: '/dashboard/students', icon: Users },
  { title: 'Teachers', url: '/dashboard/teachers', icon: GraduationCap },
  { title: 'Courses', url: '/dashboard/courses', icon: BookOpen },
  { title: 'Reports', url: '/dashboard/reports', icon: BarChart3 },
]

const settingsNavItems = [
  { title: 'Settings', url: '/dashboard/settings', icon: Settings },
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
    <Sidebar className="border-r border-slate-200/70 bg-[linear-gradient(180deg,#ffffff,rgba(248,250,252,0.92))] backdrop-blur-xl dark:border-slate-800/80 dark:bg-[linear-gradient(180deg,#0f172a,rgba(2,6,23,0.96))]">
      <SidebarHeader className="border-b border-slate-200/70 px-4 py-4 dark:border-slate-800/80">
        <Link href="/dashboard" className="flex items-center gap-3 rounded-2xl">
          <div className="overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-[0_8px_24px_-12px_rgba(36,59,123,0.25)] dark:border-slate-700 dark:bg-slate-900">
            <Image
              src="/logo-blossom.png"
              alt="Blossom Institute"
              width={46}
              height={46}
              className="h-[46px] w-[46px] object-cover"
              priority
            />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Blossom Institute
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              Academic admin
            </p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
            Main
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-1.5">
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
                        'h-11 rounded-2xl px-3 text-sm font-medium transition',
                        isActive
                          ? 'bg-[#243B7B] text-white shadow-[0_14px_30px_-14px_rgba(36,59,123,0.55)] hover:bg-[#243B7B]'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100'
                      )}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon
                          className={cn(
                            'size-4 shrink-0',
                            isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'
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

        <SidebarSeparator className="my-4 bg-slate-200/80 dark:bg-slate-800" />

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
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
                        'h-11 rounded-2xl px-3 text-sm font-medium transition',
                        isActive
                          ? 'bg-[#243B7B] text-white shadow-[0_14px_30px_-14px_rgba(36,59,123,0.55)] hover:bg-[#243B7B]'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100'
                      )}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon
                          className={cn(
                            'size-4 shrink-0',
                            isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'
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

      <SidebarFooter className="border-t border-slate-200/70 p-3 dark:border-slate-800/80">
        {!mounted ? (
          <div className="flex w-full items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-3 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Avatar className="size-10 ring-1 ring-primary/10">
              <AvatarImage src="/avatars/admin.jpg" alt={fullName} />
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                {fullName}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {user.email}
              </p>
            </div>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-3 py-3 text-left shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
              >
                <Avatar className="size-10 ring-1 ring-primary/10">
                  <AvatarImage src="/avatars/admin.jpg" alt={fullName} />
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {fullName}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {user.email}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="start"
              side="top"
              className="w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.25)] dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mb-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {fullName}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
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

              <DropdownMenuSeparator className="my-2 bg-slate-200 dark:bg-slate-800" />

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