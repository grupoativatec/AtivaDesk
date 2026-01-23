"use client"

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface BarChartProps {
  data: Array<{ name: string; value: number;[key: string]: string | number }>
  title?: string
  description?: string
  loading?: boolean
  className?: string
  dataKey?: string
  color?: string
}

export function BarChart({
  data,
  title,
  description,
  loading,
  className,
  dataKey = "value",
  color = "hsl(var(--primary))",
}: BarChartProps) {
  const isEmbedded = className?.includes("border-0 shadow-none")

  if (loading) {
    if (isEmbedded) {
      return <Skeleton className="h-[300px] w-full" />
    }
    return (
      <Card className={cn("border-0 shadow-sm", className)}>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
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
      <RechartsBarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="name"
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            padding: "8px 12px",
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
        />
        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
      </RechartsBarChart>
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
