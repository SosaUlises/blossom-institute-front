'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { performanceChartData } from '@/lib/placeholder-data'

const colors = [
  'hsl(var(--primary))',
  'hsl(var(--primary) / 0.8)',
  'hsl(var(--primary) / 0.6)',
  'hsl(var(--primary) / 0.4)',
  'hsl(var(--primary) / 0.3)',
]

export function PerformanceChart() {
  return (
    <Card className="border-border/60 bg-white/95 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Academic Performance</CardTitle>
        <CardDescription>Average grades by subject this semester</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceChartData} layout="vertical" barSize={20}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                className="text-xs fill-muted-foreground"
              />
              <YAxis
                dataKey="subject"
                type="category"
                tickLine={false}
                axisLine={false}
                className="text-xs fill-muted-foreground"
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                }}
                labelStyle={{ fontWeight: 600 }}
                formatter={(value: number) => [`${value}%`, 'Average']}
              />
              <Bar dataKey="average" radius={[0, 4, 4, 0]}>
                {performanceChartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
