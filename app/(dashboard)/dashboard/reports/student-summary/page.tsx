import { AppHeader } from '@/components/layout/app-header'
import { StudentSummaryReportView } from '@/components/reports/student-summary-report-view'

export default function ReportsStudentSummaryPage() {
  return (
    <>
      <AppHeader title="Student summary" />

      <div className="flex-1 overflow-auto px-6 py-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Student summary
            </h2>
            <p className="text-sm text-muted-foreground">
              Consultá el resumen académico completo de un alumno por curso y trimestre.
            </p>
          </section>

          <StudentSummaryReportView />
        </div>
      </div>
    </>
  )
}