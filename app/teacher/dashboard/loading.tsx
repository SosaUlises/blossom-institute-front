import { AppHeader } from '@/components/layout/app-header'

function DashboardSkeletonBlock({
  className = '',
}: {
  className?: string
}) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-2xl border border-border/60 bg-card/95 p-4 shadow-sm dark:bg-card/80 ${className}`}
    >
      <div className="space-y-3">
        <div className="h-4 w-32 animate-pulse rounded-md bg-muted/45" />
        <div className="h-6 w-48 max-w-full animate-pulse rounded-md bg-muted/50" />
        <div className="h-4 w-full max-w-sm animate-pulse rounded-md bg-muted/35" />
      </div>
      <div className="mt-5 space-y-2">
        <div className="h-10 w-full animate-pulse rounded-lg bg-muted/30" />
        <div className="h-10 w-2/3 animate-pulse rounded-lg bg-muted/25" />
      </div>
    </div>
  )
}

function DashboardSkeletonRows({ rows = 3 }: { rows?: number }) {
  return (
    <div
      aria-hidden="true"
      className="rounded-2xl border border-border/60 bg-card/90 p-3.5 shadow-sm dark:bg-card/70 sm:p-4"
    >
      <div className="mb-3 flex items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="h-4 w-44 animate-pulse rounded-md bg-muted/45" />
          <div className="h-3 w-64 max-w-full animate-pulse rounded-md bg-muted/30" />
        </div>
        <div className="h-7 w-20 animate-pulse rounded-lg bg-muted/30" />
      </div>
      <div className="grid gap-2">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="grid gap-3 rounded-xl border border-border/30 bg-background/45 p-3.5 sm:grid-cols-[44px_minmax(0,1fr)_120px] sm:items-center"
          >
            <div className="size-10 animate-pulse rounded-full bg-muted/40" />
            <div className="space-y-2">
              <div className="h-4 w-40 animate-pulse rounded-md bg-muted/45" />
              <div className="h-3 w-56 max-w-full animate-pulse rounded-md bg-muted/30" />
            </div>
            <div className="h-9 w-full animate-pulse rounded-lg bg-muted/30" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function TeacherDashboardLoading() {
  return (
    <>
      <AppHeader title="Inicio" />

      <main className="flex-1 overflow-auto px-5 pb-5 pt-8 sm:pt-9 lg:px-8 lg:pb-6 lg:pt-10">
        <p className="sr-only" role="status" aria-live="polite">
          Cargando inicio docente.
        </p>
        <div className="mx-auto max-w-7xl space-y-5">
          <header
            aria-hidden="true"
            className="border-b border-border/60 pb-5 pt-1 sm:pb-6"
          >
            <div className="max-w-3xl space-y-3">
              <div className="h-8 w-56 animate-pulse rounded-md bg-muted/45" />
              <div className="h-4 w-full max-w-xl animate-pulse rounded-md bg-muted/35" />
              <div className="h-4 w-40 animate-pulse rounded-md bg-muted/25" />
            </div>
          </header>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] lg:items-start">
            <DashboardSkeletonBlock />
            <DashboardSkeletonRows rows={3} />
          </div>

          <DashboardSkeletonRows rows={2} />
        </div>
      </main>
    </>
  )
}
