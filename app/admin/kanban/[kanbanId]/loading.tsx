import { Skeleton } from "@/components/ui/skeleton"

export default function KanbanBoardLoading() {
  return (
    <div className="flex flex-col h-screen w-full">
      {/* Topbar skeleton */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </header>

      {/* Filters bar skeleton */}
      <div className="sticky top-16 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center gap-3 px-6">
          <Skeleton className="h-9 flex-1 max-w-sm" />
          <Skeleton className="h-9 w-[140px]" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* Board skeleton */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full p-6">
          <div className="flex gap-4 h-full overflow-x-auto pb-4">
            {/* Colunas skeleton */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-shrink-0 w-80">
                <div className="bg-card rounded-lg border h-full flex flex-col">
                  {/* Header da coluna */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-5 w-8" />
                    </div>
                  </div>

                  {/* Cards skeleton */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                    {[1, 2, 3].map((j) => (
                      <div
                        key={j}
                        className="bg-background rounded-lg border p-4 space-y-2"
                      >
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <div className="flex items-center gap-2 mt-3">
                          <Skeleton className="h-6 w-6 rounded-full" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
