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
import type { DashboardAverageGradeByCourse } from '@/lib/admin/dashboard/types'

interface PerformanceChartProps {
  data: DashboardAverageGradeByCourse[]
}

const BAR_COLORS = ['#3552A1', '#4664B8', '#5A77C8', '#7B96D8', '#A3B6E7']

export function PerformanceChart({ data }: PerformanceChartProps) {
  const maxValue = Math.max(...data.map((x) => x.averageGrade), 10)
  const domainMax = maxValue <= 10 ? 10 : 100

  return (
    <Card className="rounded-[28px] border border-border/60 bg-card/95 text-card-foreground shadow-[0_18px_40px_-24px_rgba(15,23,42,0.16)]">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
          Promedio de calificaciones por curso
        </CardTitle>
        <CardDescription className="text-sm leading-6 text-muted-foreground">
          Rendimiento académico consolidado según evaluaciones registradas por curso.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        {data.length === 0 ? (
          <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 text-sm text-muted-foreground">
            No hay datos de calificaciones para mostrar.
          </div>
        ) : (
          <div className="h-[360px] rounded-[24px] border border-border/50 bg-background/40 px-4 py-4 sm:px-5 sm:py-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                barSize={22}
                barCategoryGap={18}
                margin={{ top: 6, right: 42, left: 22, bottom: 6 }}
              >
                <CartesianGrid
                  strokeDasharray="3 5"
                  horizontal={false}
                  stroke="rgba(148, 163, 184, 0.18)"
                />

                <XAxis
                  type="number"
                  domain={[0, domainMax]}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  className="text-xs fill-muted-foreground"
                />

                <YAxis
                  dataKey="cursoNombre"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={12}
                  width={132}
                  className="text-xs fill-foreground"
                />

                <Tooltip
                  cursor={{ fill: 'rgba(53,82,161,0.06)' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '18px',
                    boxShadow: '0 18px 42px -24px rgba(15,23,42,0.24)',
                    fontSize: '0.875rem',
                    padding: '10px 12px',
                  }}
                  formatter={(value: number) => [`${value.toFixed(2)}`, 'Promedio']}
                  labelStyle={{
                    color: 'hsl(var(--foreground))',
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                />

                <Bar
                  dataKey="averageGrade"
                  radius={[0, 999, 999, 0]}
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}

                  <LabelList
                    dataKey="averageGrade"
                    position="right"
                    offset={8}
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