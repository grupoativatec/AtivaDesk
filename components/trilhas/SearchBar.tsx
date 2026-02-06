"use client"

import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"

export default function SearchBar() {
    const router = useRouter()
    const sp = useSearchParams()

    const initial = useMemo(() => sp.get("q") ?? "", [sp])
    const [value, setValue] = useState(initial)

    function applyQuery(nextQ: string) {
        const params = new URLSearchParams(sp.toString())
        if (nextQ.trim()) params.set("q", nextQ.trim())
        else params.delete("q")
        router.push(`/trilhas?${params.toString()}`)
    }

    return (
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 z-10">
            <div className="flex items-center gap-3 px-4 py-3">
                <span className="text-slate-400"><Search /></span>

                <input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") applyQuery(value)
                    }}
                    placeholder="Search..."
                    className="w-full bg-transparent text-sm outline-none dark:text-black"
                />

                <div className="h-7 w-px bg-slate-200" />


            </div>
        </div>
    )
}
