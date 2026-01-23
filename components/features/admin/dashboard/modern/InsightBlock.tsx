"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface InsightBlockProps {
  title: string
  currentValue: number | string
  previousValue: number | string
  unit?: string
  isPositive?: boolean
  description?: string
  loading?: boolean
  className?: string
}

export function InsightBlock({
  title,
  currentValue,
  previousValue,
  unit = "",
  isPositive = true,
  description,
  loading,
  className,
}: InsightBlockProps) {
  if (loading) {
    return (
      <Card className={cn("border-0 shadow-sm", className)}>
        <CardContent className="p-6">
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-3 w-40" />
        </CardContent>
      </Card>
    )
  }

  const TrendIcon = isPositive ? TrendingUp : TrendingDown
  const variation = typeof currentValue === "number" && typeof previousValue === "number"
    ? previousValue > 0
      ? ((currentValue - previousValue) / previousValue) * 100
      : currentValue > 0
        ? 100
        : 0
    : 0

  return (
    <Card className={cn("border-0 shadow-sm", className)}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
                isPositive
                  ? "bg-green-500/10 text-green-600 dark:text-green-500"
                  : "bg-red-500/10 text-red-600 dark:text-red-500"
              )}
            >
              <TrendIcon className="h-3 w-3" />
              <span>{Math.abs(variation).toFixed(1)}%</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{currentValue}</span>
              {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
            </div>
            <div className="text-xs text-muted-foreground">
              vs. {previousValue} {unit} anterior
            </div>
          </div>
          {description && (
            <div className="text-xs text-muted-foreground/70 pt-2 border-t">
              {description}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
