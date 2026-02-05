"use client"

type Props = { title: string; content: string }

export function TrilhasPreview({ title, content }: Props) {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-lg font-semibold">{title || "Prévia"}</h2>
            </div>

            <div
                className="prose prose-sm dark:prose-invert max-w-none
                   [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg
                   [&_pre]:overflow-auto [&_pre]:rounded-lg"
                dangerouslySetInnerHTML={{ __html: content || "<p></p>" }}
            />
        </div>
    )
}
