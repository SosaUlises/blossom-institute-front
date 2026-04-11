'use client'

import { AppHeader } from '@/components/layout/app-header'
import { MarksReportView } from '@/components/admin/reports/marks-report-view'

export default function ReportsMarksPage() {
  return (
    <>
      <AppHeader title="Marks report" />

      <div className="flex-1 overflow-auto px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <MarksReportView />
        </div>
      </div>
    </>
  )
}