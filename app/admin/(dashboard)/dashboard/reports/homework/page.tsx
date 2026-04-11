import { AppHeader } from '@/components/layout/app-header'
import { HomeworkReportView } from '@/components/admin/reports/homework-report-view'

export default function ReportsHomeworkPage() {
  return (
    <>
      <AppHeader title="Homework report" />

      <div className="flex-1 overflow-auto px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <HomeworkReportView />
        </div>
      </div>
    </>
  )
}