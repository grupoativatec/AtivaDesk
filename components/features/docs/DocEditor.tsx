"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MarkdownRenderer } from "./MarkdownRenderer"
import { Card, CardContent } from "@/components/ui/card"

interface DocEditorProps {
  title: string
  summary: string
  content: string
  onTitleChange: (title: string) => void
  onSummaryChange: (summary: string) => void
  onContentChange: (content: string) => void
}

export function DocEditor({
  title,
  summary,
  content,
  onTitleChange,
  onSummaryChange,
  onContentChange,
}: DocEditorProps) {
  return (
    <div className="space-y-4">
      {/* Título */}
      <div className="space-y-2">
        <Label htmlFor="doc-title" className="text-sm font-medium">
          Título
        </Label>
        <Input
          id="doc-title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Ex: Como configurar VPN corporativa"
          className="text-lg font-semibold"
        />
      </div>

      {/* Summary */}
      <div className="space-y-2">
        <Label htmlFor="doc-summary" className="text-sm font-medium">
          Resumo
        </Label>
        <Textarea
          id="doc-summary"
          value={summary}
          onChange={(e) => onSummaryChange(e.target.value)}
          placeholder="Breve descrição do documento..."
          rows={2}
          className="resize-none"
        />
      </div>

      {/* Editor Markdown */}
      <div className="space-y-2">
        <Label htmlFor="doc-content" className="text-sm font-medium">
          Conteúdo (Markdown)
        </Label>
        <Textarea
          id="doc-content"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="# Título do documento

Comece escrevendo seu conteúdo aqui em Markdown..."
          rows={20}
          className="font-mono text-sm resize-none min-h-[300px] sm:min-h-[400px]"
        />
        <p className="text-xs text-muted-foreground">
          Use <code className="px-1 py-0.5 bg-muted rounded text-xs">#</code>,{" "}
          <code className="px-1 py-0.5 bg-muted rounded text-xs">##</code> para títulos,{" "}
          <code className="px-1 py-0.5 bg-muted rounded text-xs">```</code> para código
        </p>
      </div>
    </div>
  )
}

interface DocPreviewProps {
  content: string
  title: string
}

export function DocPreview({ content, title }: DocPreviewProps) {
  if (!content.trim()) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">
              Comece escrevendo para ver a prévia
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="prose-content">
      {title && (
        <h1 className="text-3xl font-bold mb-4 text-foreground">{title}</h1>
      )}
      <MarkdownRenderer content={content} />
    </div>
  )
}
