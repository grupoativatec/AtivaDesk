"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardChartProps {
  loading?: boolean
}

export function DashboardChart({ loading }: DashboardChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<"3months" | "30days" | "7days">("7days")

  // Dados mockados para o gráfico
  const chartData = {
    "7days": [
      { date: "23 Jun", value: 45 },
      { date: "24 Jun", value: 52 },
      { date: "25 Jun", value: 48 },
      { date: "26 Jun", value: 61 },
      { date: "27 Jun", value: 55 },
      { date: "28 Jun", value: 67 },
      { date: "29 Jun", value: 72 },
    ],
    "30days": Array.from({ length: 30 }, (_, i) => ({
      date: `${i + 1} Jun`,
      value: Math.floor(Math.random() * 50) + 30,
    })),
    "3months": Array.from({ length: 12 }, (_, i) => ({
      date: `${i + 1} Mar`,
      value: Math.floor(Math.random() * 100) + 50,
    })),
  }

  const data = chartData[selectedPeriod]
  const maxValue = Math.max(...data.map((d) => d.value))

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg sm:text-xl font-semibold">Total de Chamados</CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Total para os últimos {selectedPeriod === "7days" ? "7 dias" : selectedPeriod === "30days" ? "30 dias" : "3 meses"}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <Button
            variant={selectedPeriod === "3months" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedPeriod("3months")}
            className="h-7 sm:h-8 px-2 sm:px-3 text-xs"
          >
            3 meses
          </Button>
          <Button
            variant={selectedPeriod === "30days" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedPeriod("30days")}
            className="h-7 sm:h-8 px-2 sm:px-3 text-xs"
          >
            30 dias
          </Button>
          <Button
            variant={selectedPeriod === "7days" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedPeriod("7days")}
            className="h-7 sm:h-8 px-2 sm:px-3 text-xs"
          >
            7 dias
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-48 sm:h-64 w-full relative">
          <svg
            viewBox={`0 0 ${data.length * 40} 200`}
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            {/* Área do gráfico */}
            <defs>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            
            {/* Linha do gráfico */}
            <polyline
              points={data
                .map(
                  (d, i) =>
                    `${i * 40 + 20},${200 - (d.value / maxValue) * 180}`
                )
                .join(" ")}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary"
            />
            
            {/* Área preenchida */}
            <polygon
              points={`0,200 ${data
                .map(
                  (d, i) =>
                    `${i * 40 + 20},${200 - (d.value / maxValue) * 180}`
                )
                .join(" ")} ${data.length * 40 - 20},200`}
              fill="url(#areaGradient)"
              className="text-primary"
            />
            
            {/* Pontos */}
            {data.map((d, i) => (
              <circle
                key={i}
                cx={i * 40 + 20}
                cy={200 - (d.value / maxValue) * 180}
                r="3"
                fill="currentColor"
                className="text-primary"
              />
            ))}
          </svg>
          
          {/* Labels do eixo X */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground px-2">
            {data.map((d, i) => (
              <span key={i} className={cn(i % 2 === 0 ? "opacity-100" : "opacity-0 sm:opacity-100")}>
                {d.date}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
