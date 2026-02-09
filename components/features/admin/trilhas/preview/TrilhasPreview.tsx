import { processContentHeadings } from "@/lib/trilhas/utils"
import TrailTimeline from "@/components/trilhas/TrailTimeline"

type Props = { title: string; content: string }

export function TrilhasPreview({ title, content }: Props) {
    const { processedContent, headings } = processContentHeadings(content)

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
            <div className="space-y-4 min-w-0">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{title || "Título da Trilha"}</h2>
                </div>

                <div
                    className="prose prose-slate dark:prose-invert max-w-none
                       [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-xl
                       [&_pre]:overflow-auto [&_pre]:rounded-xl
                       [&_h1]:scroll-mt-20 [&_h2]:scroll-mt-20 [&_h3]:scroll-mt-20 [&_h4]:scroll-mt-20"
                    dangerouslySetInnerHTML={{ __html: processedContent || "<p className='text-slate-400 italic'>O conteúdo aparecerá aqui...</p>" }}
                />
            </div>

            <div className="hidden lg:block">
                <div className="sticky top-4">
                    <TrailTimeline steps={headings} />
                </div>
            </div>
        </div>
    )
}
