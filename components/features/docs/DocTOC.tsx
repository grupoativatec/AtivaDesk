"use client"

import { useEffect, useState } from "react"
import { Heading } from "./MarkdownRenderer"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

interface DocTOCProps {
  headings: Heading[]
  className?: string
}

export function DocTOC({ headings, className }: DocTOCProps) {
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: "-100px 0px -66%",
      }
    )

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      headings.forEach((heading) => {
        const element = document.getElementById(heading.id)
        if (element) {
          observer.unobserve(element)
        }
      })
    }
  }, [headings])

  const handleClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 100
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })

      setActiveId(id)
    }
  }

  if (headings.length === 0) {
    return null
  }

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Neste documento
      </p>
      <nav className="space-y-1">
        {headings.map((heading) => {
          const isH2 = heading.level === 2
          const isActive = activeId === heading.id

          return (
            <button
              key={heading.id}
              onClick={() => handleClick(heading.id)}
              className={cn(
                "flex items-start gap-1.5 w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors",
                isH2
                  ? "font-medium text-foreground"
                  : "text-muted-foreground pl-6",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50 hover:text-foreground"
              )}
            >
              {isH2 && <ChevronRight className="size-3 mt-0.5 shrink-0" />}
              <span className="line-clamp-1">{heading.text}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
