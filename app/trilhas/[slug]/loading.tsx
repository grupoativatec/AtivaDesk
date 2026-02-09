import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Nav placeholder */}
            <div className="h-16 w-full border-b bg-white" />

            <div className="mx-auto w-full max-w-7xl px-4 py-10">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_260px]">
                    {/* Main Content Skeleton */}
                    <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5 space-y-6">
                        <div className="flex justify-between">
                            <Skeleton className="h-6 w-24 rounded-full" />
                            <Skeleton className="h-4 w-16" />
                        </div>

                        <Skeleton className="h-12 w-3/4" />

                        <div className="space-y-4 pt-6">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-4/6" />
                        </div>

                        <div className="pt-8 space-y-4">
                            <Skeleton className="h-8 w-1/3" />
                            <Skeleton className="h-32 w-full rounded-xl" />
                        </div>
                    </div>

                    {/* Sidebar Skeleton */}
                    <div className="space-y-6">
                        {/* Category info placeholder */}
                        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 space-y-4">
                            <Skeleton className="h-4 w-32" />
                            <div className="space-y-3">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>

                        {/* Timeline placeholder */}
                        <div className="space-y-4">
                            <Skeleton className="h-4 w-24 ml-1" />
                            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 space-y-6">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-6 w-6 rounded-full" />
                                        <Skeleton className="h-4 flex-1" />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-6 w-6 rounded-full" />
                                        <Skeleton className="h-4 flex-1" />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-6 w-6 rounded-full" />
                                        <Skeleton className="h-4 flex-1" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
