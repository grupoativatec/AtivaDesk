"use client"

import { type Editor } from "@tiptap/react"
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    List,
    ListOrdered,
    Quote,
    Code,
    Link as LinkIcon,
    Image as ImageIcon,
    Undo,
    Redo,
    RemoveFormatting,
    Heading1,
    Heading2,
    Heading3
} from "lucide-react"
import { Toggle } from "@/components/ui/toggle"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

type Props = {
    editor: Editor | null
}

export function EditorToolbar({ editor }: Props) {
    if (!editor) return null

    const setLink = () => {
        const previousUrl = editor.getAttributes("link").href
        const url = window.prompt("URL", previousUrl)

        if (url === null) return

        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run()
            return
        }

        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
    }

    const addImage = () => {
        const url = window.prompt("URL da imagem")
        if (url) {
            editor.chain().focus().setImage({ src: url }).run()
        }
    }

    return (
        <div
            className="border border-input bg-transparent rounded-t-md p-1 flex flex-wrap gap-1 items-center"
            onMouseDown={(e) => {
                // ✅ Previne que clicar nos botões tire o foco do editor
                e.preventDefault()
            }}
        >
            <Toggle
                size="sm"
                pressed={editor.isActive("heading", { level: 1 })}
                onPressedChange={() => {
                    editor.chain().focus().toggleHeading({ level: 1 }).run()
                }}
                className="h-8 w-8 p-0"
                aria-label="Heading 1"
            >
                <Heading1 className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive("heading", { level: 2 })}
                onPressedChange={() => {
                    editor.chain().focus().toggleHeading({ level: 2 }).run()
                }}
                className="h-8 w-8 p-0"
                aria-label="Heading 2"
            >
                <Heading2 className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive("heading", { level: 3 })}
                onPressedChange={() => {
                    editor.chain().focus().toggleHeading({ level: 3 }).run()
                }}
                className="h-8 w-8 p-0"
                aria-label="Heading 3"
            >
                <Heading3 className="h-4 w-4" />
            </Toggle>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <Toggle
                size="sm"
                pressed={editor.isActive("bold")}
                onPressedChange={() => editor.chain().focus().toggleBold().run()}
                className="h-8 w-8 p-0"
                aria-label="Bold"
            >
                <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive("italic")}
                onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                className="h-8 w-8 p-0"
                aria-label="Italic"
            >
                <Italic className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive("underline")}
                onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
                className="h-8 w-8 p-0"
                aria-label="Underline"
            >
                <Underline className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive("strike")}
                onPressedChange={() => editor.chain().focus().toggleStrike().run()}
                className="h-8 w-8 p-0"
                aria-label="Strikethrough"
            >
                <Strikethrough className="h-4 w-4" />
            </Toggle>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <Toggle
                size="sm"
                pressed={editor.isActive("bulletList")}
                onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                className="h-8 w-8 p-0"
                aria-label="Bullet List"
            >
                <List className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive("orderedList")}
                onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                className="h-8 w-8 p-0"
                aria-label="Ordered List"
            >
                <ListOrdered className="h-4 w-4" />
            </Toggle>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <Toggle
                size="sm"
                pressed={editor.isActive("blockquote")}
                onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
                className="h-8 w-8 p-0"
                aria-label="Blockquote"
            >
                <Quote className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive("codeBlock")}
                onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
                className="h-8 w-8 p-0"
                aria-label="Code Block"
            >
                <Code className="h-4 w-4" />
            </Toggle>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <Toggle
                size="sm"
                pressed={editor.isActive("link")}
                onPressedChange={setLink}
                className="h-8 w-8 p-0"
                aria-label="Link"
            >
                <LinkIcon className="h-4 w-4" />
            </Toggle>
            <Button
                size="sm"
                variant="ghost"
                onClick={addImage}
                className="h-8 w-8 p-0"
                title="Inserir imagem"
            >
                <ImageIcon className="h-4 w-4" />
            </Button>

            <div className="flex-1" />

            <Button
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
                className="h-8 w-8 p-0"
                title="Limpar formatação"
            >
                <RemoveFormatting className="h-4 w-4" />
            </Button>
            <Button
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="h-8 w-8 p-0"
                title="Desfazer"
            >
                <Undo className="h-4 w-4" />
            </Button>
            <Button
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="h-8 w-8 p-0"
                title="Refazer"
            >
                <Redo className="h-4 w-4" />
            </Button>
        </div>
    )
}