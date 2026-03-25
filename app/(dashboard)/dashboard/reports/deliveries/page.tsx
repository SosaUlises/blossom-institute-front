import { AppHeader } from '@/components/layout/app-header'

export default function ReportsDeliveriesPage() {
  return (
    <>
      <AppHeader title="Deliveries by task" />
      <div className="flex-1 overflow-auto px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-border/70 bg-card/95 p-8 text-sm text-muted-foreground">
            Próximamente: reporte de entregas por tarea.
          </div>
        </div>
      </div>
    </>
  )
}