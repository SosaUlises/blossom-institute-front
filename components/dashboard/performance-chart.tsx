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

const BAR_COLORS = ['#3552A1', '#4664B8', '#5A77C8', '#7B96D8', '#A3B6E7']

export function PerformanceChart({ data }: PerformanceChartProps) {
  const maxValue = Math.max(...data.map((x) => x.averageGrade), 10)
  const domainMax = maxValue <= 10 ? 10 : 100

  return (
    <Card className="rounded-[28px] border border-border/70 bg-card/95 text-card-foreground shadow-[0_18px_40px_-22px_rgba(30,42,68,0.18)]">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
          Promedio de calificaciones por curso
        </CardTitle>
        <CardDescription className="text-sm leading-6">
          Rendimiento académico consolidado según evaluaciones registradas por curso.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        {data.length === 0 ? (
          <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 text-sm text-muted-foreground">
            No hay datos de calificaciones para mostrar.
          </div>
        ) : (
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                barSize={16}
                margin={{ top: 8, right: 44, left: 16, bottom: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  horizontal={false}
                  className="stroke-border/60"
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
                  width={120}
                  className="text-xs fill-foreground"
                />

                <Tooltip
                  cursor={{ fill: 'rgba(53,82,161,0.05)' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '1rem',
                    boxShadow: '0 16px 38px -18px rgba(30,42,68,0.22)',
                    fontSize: '0.875rem',
                  }}
                  formatter={(value: number) => [value.toFixed(2), 'Promedio']}
                />

                <Bar dataKey="averageGrade" radius={[0, 999, 999, 0]}>
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}

                  <LabelList
                    dataKey="averageGrade"
                    position="right"
                    formatter={(value: number) => value.toFixed(2)}
                    className="fill-foreground text-xs font-semibold"
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