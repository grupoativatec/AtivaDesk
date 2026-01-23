"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface KPICardProps {
  label: string
  value: string | number
  trend?: {
    value: number
    isPositive: boolean
    label?: string
  }
  icon: LucideIcon
  iconColor?: string
  description?: string
  loading?: boolean
  onClick?: () => void
}

export function KPICard({
  label,
  value,
  trend,
  icon: Icon,
  iconColor = "text-blue-600",
  description,
  loading,
  onClick,
}: KPICardProps) {
  if (loading) {
    return (
      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-5 w-16 rounded" />
          </div>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    )
  }

  const TrendIcon = trend?.isPositive ? TrendingUp : TrendingDown

  return (
    <Card
      className={cn(
        "border-0 shadow-sm hover:shadow-md transition-all duration-200",
        onClick && "cursor-pointer hover:-translate-y-0.5"
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              "p-2.5 rounded-lg bg-muted/50",
              iconColor.includes("text-") && iconColor.replace("text-", "bg-").replace("-600", "-500/10")
            )}
          >
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
          {trend && (
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
                trend.isPositive
                  ? "bg-green-500/10 text-green-600 dark:text-green-500"
                  : "bg-red-500/10 text-red-600 dark:text-red-500"
              )}
            >
              <TrendIcon className="h-3 w-3" />
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <div className="text-3xl font-bold tracking-tight">{value}</div>
          <div className="text-sm font-medium text-muted-foreground">
            {label}
          </div>
          {description && (
            <div className="text-xs text-muted-foreground/70 mt-1">
              {description}
            </div>
          )}
          {trend?.label && (
            <div className="text-xs text-muted-foreground/60 mt-0.5">
              {trend.label}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
