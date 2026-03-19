'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setTheme('light')
    setMounted(true)
  }, [setTheme])

  if (!mounted) return null

  return <div className="min-h-screen bg-background">{children}</div>
}