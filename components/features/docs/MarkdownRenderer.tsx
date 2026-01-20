"use client"

import { useEffect, useRef } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { cn } from "@/lib/utils"

interface MarkdownRendererProps {
  content: string
  className?: string
  onHeadingsChange?: (headings: Heading[]) => void
}

export interface Heading {
  id: string
  text: string
  level: number
}

function slugifyHeading(text: string, usedIds: Set<string>): string {
  const base =
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section"

  let id = base
  let suffix = 2

  while (usedIds.has(id)) {
    id = `${base}-${suffix}`
    suffix += 1
  }

  usedIds.add(id)
  return id
}

export function MarkdownRenderer({
  content,
  className,
  onHeadingsChange,
}: MarkdownRendererProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!contentRef.current || !onHeadingsChange) return

    const usedIds = new Set<string>()

    const headings = Array.from(
      contentRef.current.querySelectorAll("h2, h3")
    )
      .map((el) => {
        const text = (el.textContent || "").trim()
        if (!text) {
          return null
        }

        let id = el.id
        if (!id) {
          id = slugifyHeading(text, usedIds)
          el.id = id
        } else {
          // Garante unicidade mesmo para IDs já existentes
          if (usedIds.has(id)) {
            id = slugifyHeading(text, usedIds)
            el.id = id
          } else {
            usedIds.add(id)
          }
        }

        return {
          id,
          text,
          level: parseInt(el.tagName.charAt(1), 10),
        }
      })
      .filter((h): h is Heading => h !== null)

    onHeadingsChange(headings)
  }, [content, onHeadingsChange])

  return (
    <div
      ref={contentRef}
      className={cn(
        "markdown-content max-w-none",
        "[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:text-foreground",
        "[&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:text-foreground [&_h2]:scroll-mt-20",
        "[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-foreground [&_h3]:scroll-mt-20",
        "[&_p]:text-foreground/90 [&_p]:leading-relaxed [&_p]:my-4",
        "[&_strong]:text-foreground [&_strong]:font-semibold",
        "[&_em]:text-foreground [&_em]:italic",
        "[&_code]:text-primary [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_code:not(pre_code)]:before:content-[''] [&_code:not(pre_code)]:after:content-['']",
        "[&_pre]:bg-muted [&_pre]:border [&_pre]:border-border [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:my-4",
        "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-foreground",
        "[&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-4 [&_ul]:space-y-1",
        "[&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-4 [&_ol]:space-y-1",
        "[&_li]:my-2",
        "[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_blockquote]:text-muted-foreground",
        "[&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary/80",
        "[&_table]:w-full [&_table]:border-collapse [&_table]:my-4",
        "[&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-foreground",
        "[&_td]:border [&_td]:border-border [&_td]:px-4 [&_td]:py-2 [&_td]:text-foreground/90",
        "[&_img]:rounded-lg [&_img]:my-4 [&_img]:max-w-full [&_img]:h-auto",
        "[&_hr]:border-border [&_hr]:my-6",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: ({ node, ...props }) => {
            const src = props.src || ""
            
            // Não renderizar se src estiver vazio
            if (!src || src.trim() === "") {
              return null
            }
            
            // Se for uma URL externa ou relativa, usar img normal
            if (src.startsWith("http") || src.startsWith("/")) {
              return (
                <img
                  {...props}
                  src={src}
                  alt={props.alt || ""}
                  className="rounded-lg my-4 max-w-full h-auto"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback para imagem quebrada
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                  }}
                />
              )
            }
            
            return (
              <img
                {...props}
                src={src}
                alt={props.alt || ""}
                className="rounded-lg my-4 max-w-full h-auto"
                loading="lazy"
              />
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
