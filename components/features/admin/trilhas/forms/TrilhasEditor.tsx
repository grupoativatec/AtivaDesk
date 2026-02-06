"use client"

import { useEffect, useMemo, useRef } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import Placeholder from "@tiptap/extension-placeholder"
import { EditorToolbar } from "./EditorToolbar"

type Props = {
    title: string
    excerpt: string
    content: string
    onTitleChange: (v: string) => void
    onExcerptChange: (v: string) => void
    onContentChange: (v: string) => void
}

function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

export function TrilhasEditor(props: Props) {
    const { title, excerpt, content, onTitleChange, onExcerptChange, onContentChange } = props

    // guarda o "último HTML" conhecido DO EDITOR (normalizado)
    const lastHtmlRef = useRef<string>(content || "")

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
                // ✅ Desabilita hardBreak (Shift+Enter vira <br>) para forçar parágrafos
                hardBreak: false,
                // ✅ Configura o parágrafo
                paragraph: {
                    HTMLAttributes: {
                        class: 'my-2',
                    },
                },
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                autolink: true,
                linkOnPaste: true,
            }),
            Image.configure({
                inline: false,
                allowBase64: true,
            }),
            Placeholder.configure({
                placeholder: "Escreva aqui… você pode colar prints (Ctrl+V) ou arrastar imagens.",
            }),
        ],
        content: content || "",
        editorProps: {
            attributes: {
                class:
                    "prose prose-sm dark:prose-invert max-w-none focus:outline-none",
            },
            handlePaste: (view, event) => {
                const clipboard = event.clipboardData
                if (!clipboard) return false

                const files = Array.from(clipboard.files || [])
                const image = files.find((f) => f.type.startsWith("image/"))
                if (!image) return false

                event.preventDefault()

                    ; (async () => {
                        const src = await fileToDataUrl(image)
                        editor?.chain().focus().setImage({ src }).run()
                    })()

                return true
            },
            handleDrop: (view, event) => {
                const dt = event.dataTransfer
                if (!dt) return false

                const files = Array.from(dt.files || [])
                const image = files.find((f) => f.type.startsWith("image/"))
                if (!image) return false

                event.preventDefault()

                    ; (async () => {
                        const src = await fileToDataUrl(image)
                        editor?.chain().focus().setImage({ src }).run()
                    })()

                return true
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML()

            // ✅ atualiza o ref ANTES de subir pro parent (evita loop)
            lastHtmlRef.current = html
            onContentChange(html)
        },
    })

    // ✅ Só aplica setContent se vier mudança externa real (ex: carregou outro post)
    useEffect(() => {
        if (!editor) return

        const incoming = content || ""
        if (incoming === lastHtmlRef.current) return

        editor.commands.setContent(incoming, { emitUpdate: false })
        lastHtmlRef.current = incoming
    }, [content, editor])

    return (
        <div className="space-y-3">
            <div className="space-y-2">
                <label className="text-sm font-medium">Título</label>
                <input
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                    placeholder="Título do post"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Resumo</label>
                <textarea
                    value={excerpt}
                    onChange={(e) => onExcerptChange(e.target.value)}
                    className="w-full min-h-[90px] rounded-md border bg-background px-3 py-2 text-sm resize-y"
                    placeholder="Resumo curto (excerpt)"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Conteúdo</label>
                <div className="rounded-md border bg-background">
                    <EditorToolbar editor={editor} />
                    <EditorContent editor={editor} className="p-3 min-h-[350px]" />
                </div>

                <p className="text-xs text-muted-foreground">
                    Dica: pressione <kbd>Enter</kbd> para novo parágrafo. Cole prints com <kbd>Ctrl</kbd>+<kbd>V</kbd>.
                </p>
            </div>
        </div>
    )
}