'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
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

const BAR_COLORS = ['#243B7B', '#2F4B97', '#4767B3', '#6F8FD6', '#C63D4F']

export function PerformanceChart({ data }: PerformanceChartProps) {
  const maxValue = Math.max(...data.map((x) => x.averageGrade), 10)
  const domainMax = maxValue <= 10 ? 10 : 100

  return (
    <Card className="border-border/70 bg-card/95 text-card-foreground shadow-[0_10px_30px_-10px_rgba(30,42,68,0.10)]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold tracking-tight">
          Promedio de calificaciones por curso
        </CardTitle>
        <CardDescription>
          Rendimiento académico general según evaluaciones registradas
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        {data.length === 0 ? (
          <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 text-sm text-muted-foreground">
            No hay datos de calificaciones para mostrar.
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                barSize={20}
                margin={{ top: 8, right: 36, left: 8, bottom: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  className="stroke-muted/70"
                />

                <XAxis
                  type="number"
                  domain={[0, domainMax]}
                  tickLine={false}
                  axisLine={false}
                  className="text-xs fill-muted-foreground"
                />

                <YAxis
                  dataKey="cursoNombre"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={110}
                  className="text-xs fill-foreground"
                />

                <Tooltip
                  cursor={{ fill: 'rgba(36,59,123,0.05)' }}
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg, white)',
                    border: '1px solid rgb(148 163 184 / 0.25)',
                    borderRadius: '1rem',
                    boxShadow: '0 10px 30px -12px rgba(30,42,68,0.18)',
                    fontSize: '0.875rem',
                    color: 'inherit',
                  }}
                  formatter={(value: number) => [value.toFixed(2), 'Promedio']}
                />

                <Bar dataKey="averageGrade" radius={[0, 10, 10, 0]}>
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}

                  <LabelList
                    dataKey="averageGrade"
                    position="right"
                    formatter={(value: number) => value.toFixed(2)}
                    className="fill-foreground text-xs font-medium"
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}