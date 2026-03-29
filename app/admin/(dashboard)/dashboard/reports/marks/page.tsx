import { AppHeader } from '@/components/layout/app-header'
import { MarksReportView } from '@/components/admin/reports/marks-report-view'

export default function ReportsMarksPage() {
  return (
    <>
      <AppHeader title="Marks report" />

      <div className="flex-1 overflow-auto px-6 py-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Marks by term
            </h2>
            <p className="text-sm text-muted-foreground">
              Consultá quizzes, tests y promedio general por curso y trimestre.
            </p>
          </section>

          <MarksReportView />
        </div>
      </div>
    </>
  )
}