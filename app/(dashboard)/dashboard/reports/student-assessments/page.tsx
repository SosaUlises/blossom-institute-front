import { AppHeader } from '@/components/layout/app-header'
import { StudentAssessmentsDetailReportView } from '@/components/reports/student-assessments-detail-report-view'

export default function ReportsStudentAssessmentsPage() {
  return (
    <>
      <AppHeader title="Student assessments detail" />

      <div className="flex-1 overflow-auto px-6 py-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Student assessments detail
            </h2>
            <p className="text-sm text-muted-foreground">
              Consultá el detalle cronológico de evaluaciones por alumno, incluyendo homework, quiz, test y skills por calificación.
            </p>
          </section>

          <StudentAssessmentsDetailReportView />
        </div>
      </div>
    </>
  )
}