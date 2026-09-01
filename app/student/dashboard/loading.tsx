import { AppHeader } from '@/components/layout/app-header'
import { Skeleton } from '@/components/ui/skeleton'

function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <section
      aria-hidden="true"
      className={`rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm dark:bg-card/65 sm:p-5 ${className}`}
    >
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-3 h-7 w-2/3 max-w-sm" />
      <Skeleton className="mt-2 h-4 w-full max-w-xl" />
      <Skeleton className="mt-2 h-4 w-3/4 max-w-lg" />
    </section>
  )
}

export default function StudentDashboardLoading() {
  return (
    <>
      <AppHeader title="Inicio" subtitle="Blossom Institute · Alumno" />
      <main
        aria-busy="true"
        aria-label="Cargando inicio del alumno"
        className="flex-1 overflow-auto px-5 pb-5 pt-8 sm:pt-9 lg:px-8 lg:pb-6 lg:pt-10"
      >
        <span className="sr-only">Cargando inicio del alumno.</span>
        <div className="mx-auto max-w-4xl space-y-5">
          <header aria-hidden="true" className="border-b border-border/60 pb-5 pt-1 sm:pb-6">
            <Skeleton className="h-8 w-72 max-w-full" />
            <Skeleton className="mt-3 h-4 w-full max-w-xl" />
            <Skeleton className="mt-2 h-4 w-36" />
          </header>

          <div className="space-y-5">
            <SkeletonCard />

            <section
              aria-hidden="true"
              className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm dark:bg-card/65 sm:p-5"
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:items-center">
                <div>
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="mt-3 h-7 w-52" />
                  <Skeleton className="mt-2 h-4 w-full max-w-md" />
                </div>
                <div className="rounded-xl border border-border/55 bg-background/45 px-3.5 py-3 dark:bg-background/25">
                  <div className="flex flex-wrap gap-3">
                    <Skeleton className="h-7 w-32" />
                    <Skeleton className="h-7 w-36" />
                    <Skeleton className="h-7 w-28" />
                  </div>
                </div>
              </div>
            </section>

            <section
              aria-hidden="true"
              className="space-y-3 rounded-2xl border border-border/60 bg-card/65 p-4 dark:bg-card/50"
            >
              <div>
                <Skeleton className="h-6 w-44" />
                <Skeleton className="mt-2 h-4 w-full max-w-md" />
              </div>
              <div className="rounded-xl border border-border/55 bg-background/35 dark:bg-background/20">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex gap-3 border-b border-border/55 px-2.5 py-3 last:border-b-0"
                  >
                    <Skeleton className="size-8 shrink-0 rounded-full" />
                    <div className="min-w-0 flex-1">
                      <Skeleton className="h-4 w-2/3 max-w-sm" />
                      <Skeleton className="mt-2 h-4 w-full max-w-lg" />
                      <Skeleton className="mt-2 h-3 w-40" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  )
}
