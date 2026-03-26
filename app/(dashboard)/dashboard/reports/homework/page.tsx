import { AppHeader } from '@/components/layout/app-header'
import { HomeworkReportView } from '@/components/reports/homework-report-view'

export default function ReportsHomeworkPage() {
  return (
    <>
      <AppHeader title="Homework report" />

      <div className="flex-1 overflow-auto px-6 py-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Homework by term
            </h2>
            <p className="text-sm text-muted-foreground">
              Consultá entregas, pendientes, rehacer, aprobadas y promedio por curso y trimestre.
            </p>
          </section>

          <HomeworkReportView />
        </div>
      </div>
    </>
  )
}