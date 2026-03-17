import { Clock, MapPin, Users } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { upcomingClasses } from '@/lib/placeholder-data'

export function UpcomingClassesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Upcoming Classes</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-80">
          <div className="space-y-1 px-6 pb-6">
            {upcomingClasses.map((classItem) => (
              <div
                key={classItem.id}
                className="rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{classItem.courseName}</h4>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {classItem.teacherName}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1">
                    <Clock className="size-3 text-primary" />
                    <span className="text-xs font-medium text-primary">
                      {classItem.time}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  {classItem.room && (
                    <div className="flex items-center gap-1">
                      <MapPin className="size-3" />
                      <span>{classItem.room}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Users className="size-3" />
                    <span>{classItem.studentsCount} students</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
