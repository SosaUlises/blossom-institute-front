'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { DashboardAverageGradeByCourse } from '@/lib/dashboard/types'

interface PerformanceChartProps {
  data: DashboardAverageGradeByCourse[]
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  return (
    <Card className="border-border/60 bg-white/95 shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm font-semibold tracking-tight">
          Promedio de calificaciones por curso
        </CardTitle>
        <CardDescription>
          Rendimiento académico general según evaluaciones registradas
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" barSize={18} margin={{ left: 8, right: 16 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-muted"
                horizontal={false}
              />
              <XAxis
                type="number"
                domain={[0, 10]}
                tickLine={false}
                axisLine={false}
                className="text-xs fill-muted-foreground"
              />
              <YAxis
                dataKey="cursoNombre"
                type="category"
                tickLine={false}
                axisLine={false}
                className="text-xs fill-muted-foreground"
                width={110}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '1rem',
                  fontSize: '0.875rem',
                }}
                formatter={(value: number) => [value.toFixed(2), 'Promedio']}
              />
              <Bar
                dataKey="averageGrade"
                radius={[0, 8, 8, 0]}
                fill="hsl(var(--primary))"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}