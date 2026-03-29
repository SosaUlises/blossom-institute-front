'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreHorizontal, ChevronRight, type LucideIcon } from 'lucide-react'

type Action = {
  label: string
  onClick: () => void
  icon: LucideIcon
  destructive?: boolean
}

type Position = {
  top: number
  left: number
}

export function RowActions({ actions }: { actions: Action[] }) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 })

  const rootRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const updatePosition = () => {
    const button = buttonRef.current
    if (!button) return

    const rect = button.getBoundingClientRect()
    const menuWidth = 240
    const viewportPadding = 12

    let left = rect.right - menuWidth
    if (left < viewportPadding) left = viewportPadding
    if (left + menuWidth > window.innerWidth - viewportPadding) {
      left = window.innerWidth - menuWidth - viewportPadding
    }

    const top = rect.bottom + 10

    setPosition({ top, left })
  }

  useLayoutEffect(() => {
    if (!open) return

    updatePosition()

    const handleResize = () => updatePosition()
    const handleScroll = () => updatePosition()

    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, true)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (!rootRef.current?.contains(target)) {
        setOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`group flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-background/85 text-muted-foreground shadow-sm backdrop-blur-sm transition-all hover:-translate-y-[1px] hover:bg-card hover:text-foreground hover:shadow-md ${
          open ? 'border-primary/20 bg-primary/5 text-primary shadow-md' : ''
        }`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Abrir acciones"
      >
        <MoreHorizontal className="size-4.5 transition-transform duration-200 group-hover:scale-105" />
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                key="row-actions-menu"
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className="fixed z-[9999] w-60 overflow-hidden rounded-[22px] border border-border/70 bg-card/95 p-2 shadow-[0_28px_60px_-26px_rgba(20,28,45,0.38)] backdrop-blur-xl"
                style={{
                  top: position.top,
                  left: position.left,
                }}
              >
                <div className="mb-1 px-2 py-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Acciones
                  </p>
                </div>

                <div className="space-y-1">
                  {actions.map((action, index) => {
                    const Icon = action.icon

                    return (
                      <motion.button
                        key={`${action.label}-${index}`}
                        type="button"
                        whileHover={{ x: 1 }}
                        onClick={() => {
                          setOpen(false)
                          action.onClick()
                        }}
                        className={`group flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm transition-all ${
                          action.destructive
                            ? 'text-red-600 hover:bg-red-500/10 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'
                            : 'text-foreground hover:bg-muted/60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex size-8 items-center justify-center rounded-xl border ${
                              action.destructive
                                ? 'border-red-500/15 bg-red-500/10'
                                : 'border-border/60 bg-background/80'
                            }`}
                          >
                            <Icon className="size-4" />
                          </div>

                          <span className="font-medium">{action.label}</span>
                        </div>

                        <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  )
}