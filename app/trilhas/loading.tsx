import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Skeleton */}
            <div className="relative h-[400px] w-full bg-slate-900 overflow-hidden">
                <div className="mx-auto max-w-7xl px-4 h-full flex items-center">
                    <div className="flex items-start gap-6 w-full">
                        <Skeleton className="hidden md:block h-[120px] w-[120px] rounded-full opacity-20" />
                        <div className="space-y-4 flex-1">
                            <Skeleton className="h-16 w-1/2 opacity-20" />
                            <Skeleton className="h-20 w-34 opacity-20" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto w-full max-w-7xl px-4">
                <div className="pt-14">
                    <div className="mt-8 grid grid-cols-1 gap-6 pb-12 md:grid-cols-[1fr_260px]">
                        {/* Posts List Skeleton */}
                        <div className="space-y-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5 space-y-4">
                                    <div className="flex gap-4">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                    <Skeleton className="h-8 w-3/4" />
                                    <Skeleton className="h-16 w-full" />
                                </div>
                            ))}
                        </div>

                        {/* Sidebar Skeleton */}
                        <div className="rounded-xl bg-white p-1 shadow-sm ring-1 ring-black/5 space-y-1 h-fit">
                            <div className="p-3 space-y-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <Skeleton className="h-2 w-2 rounded-full" />
                                        <Skeleton className="h-4 flex-1" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
