import { AppHeader } from '@/components/layout/app-header'
import { DeliveriesByTaskReportView } from '@/components/reports/deliveries-by-task-report-view'

export default function ReportsDeliveriesPage() {
  return (
    <>
      <AppHeader title="Deliveries by task" />

      <div className="flex-1 overflow-auto px-6 py-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Deliveries by task
            </h2>
            <p className="text-sm text-muted-foreground">
              Consultá el estado de las entregas de una tarea específica por curso.
            </p>
          </section>

          <DeliveriesByTaskReportView />
        </div>
      </div>
    </>
  )
}