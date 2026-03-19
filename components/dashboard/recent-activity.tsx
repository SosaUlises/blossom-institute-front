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
    <Card className="border-border/60 bg-white/95 shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm font-semibold tracking-tight">
          Recent activity
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-80">
          <div className="space-y-2 px-6 pb-6">
            {recentActivities.map((activity) => {
              const Icon = activityIcons[activity.type]
              const colorClass = activityColors[activity.type]

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 rounded-xl p-3 transition hover:bg-muted/40"
                >
                  <div className={`flex size-9 items-center justify-center rounded-xl ${colorClass}`}>
                    <Icon className="size-4" />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      {activity.description}
                    </p>
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
