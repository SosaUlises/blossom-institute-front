import {
  UserPlus,
  FileText,
  Trophy,
  CalendarCheck,
  BookOpen,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { recentActivities } from '@/lib/placeholder-data'
import type { RecentActivity } from '@/lib/types'

const activityIcons: Record<RecentActivity['type'], typeof UserPlus> = {
  enrollment: UserPlus,
  submission: FileText,
  grade: Trophy,
  attendance: CalendarCheck,
  course: BookOpen,
}

const activityColors: Record<RecentActivity['type'], string> = {
  enrollment: 'bg-primary/10 text-primary',
  submission: 'bg-chart-2/10 text-chart-2',
  grade: 'bg-chart-3/10 text-chart-3',
  attendance: 'bg-chart-4/10 text-chart-4',
  course: 'bg-chart-5/10 text-chart-5',
}

export function RecentActivityCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-80">
          <div className="space-y-1 px-6 pb-6">
            {recentActivities.map((activity) => {
              const Icon = activityIcons[activity.type]
              const colorClass = activityColors[activity.type]

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
                >
                  <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${colorClass}`}>
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
