import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Users as UsersIcon, Users2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function UsersLoading() {
  return (
    <div className="w-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border dark:border-border/30 bg-card dark:bg-card/30 shadow-sm dark:shadow-none shrink-0">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-3 sm:py-4 md:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3 md:gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                <UsersIcon className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
                <Skeleton className="h-6 sm:h-7 md:h-8 w-32" />
              </div>
              <Skeleton className="h-3 sm:h-4 md:h-5 w-64" />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Skeleton className="h-8 sm:h-9 w-20 sm:w-24" />
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 overflow-auto">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-4 sm:py-5 md:py-6 space-y-4 sm:space-y-6">
          {/* Toolbar skeleton */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 flex-1 max-w-md" />
              <Skeleton className="h-10 w-[180px]" />
              <Skeleton className="h-10 w-[180px]" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>

          {/* Table skeleton */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase">
                        Usuário
                      </th>
                      <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase">
                        Email
                      </th>
                      <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase">
                        Cargo
                      </th>
                      <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase">
                        Status
                      </th>
                      <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase">
                        Criado em
                      </th>
                      <th className="text-left p-3 sm:p-4 text-xs font-semibold text-muted-foreground uppercase">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-3 sm:p-4">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        </td>
                        <td className="p-3 sm:p-4">
                          <Skeleton className="h-4 w-48" />
                        </td>
                        <td className="p-3 sm:p-4">
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </td>
                        <td className="p-3 sm:p-4">
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </td>
                        <td className="p-3 sm:p-4">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="p-3 sm:p-4">
                          <Skeleton className="h-8 w-8" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
