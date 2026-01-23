"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface DonutChartProps {
  data: Array<{ name: string; value: number }>
  title?: string
  description?: string
  loading?: boolean
  className?: string
  colors?: string[]
}

const DEFAULT_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export function DonutChart({
  data,
  title,
  description,
  loading,
  className,
  colors = DEFAULT_COLORS,
}: DonutChartProps) {
  const isEmbedded = className?.includes("border-0 shadow-none")

  if (loading) {
    if (isEmbedded) {
      return <Skeleton className="h-[300px] w-full rounded-lg" />
    }
    return (
      <Card className={cn("border-0 shadow-sm", className)}>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    if (isEmbedded) {
      return (
        <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
          Nenhum dado disponível
        </div>
      )
    }
    return (
      <Card className={cn("border-0 shadow-sm", className)}>
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle className="text-lg font-semibold">{title}</CardTitle>}
            {description && (
              <CardDescription className="text-sm text-muted-foreground">
                {description}
              </CardDescription>
            )}
          </CardHeader>
        )}
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
            Nenhum dado disponível
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartContent = (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colors[index % colors.length]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            padding: "8px 12px",
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
        />
        <Legend
          wrapperStyle={{ fontSize: "12px" }}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  )

  if (isEmbedded) {
    return <div className={className}>{chartContent}</div>
  }

  return (
    <Card className={cn("border-0 shadow-sm", className)}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle className="text-lg font-semibold">{title}</CardTitle>}
          {description && (
            <CardDescription className="text-sm text-muted-foreground">
              {description}
            </CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent>
        {chartContent}
      </CardContent>
    </Card>
  )
}
