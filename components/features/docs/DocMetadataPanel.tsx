"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { DocStatus } from "./DocCard"

interface DocMetadataPanelProps {
  slug: string
  category: "Infra" | "Sistemas" | "Processos" | "Segurança" | "Geral"
  status: DocStatus
  onSlugChange: (slug: string) => void
  onCategoryChange: (category: DocMetadataPanelProps["category"]) => void
  onStatusChange: (status: DocStatus) => void
  slugError?: string
}

export function DocMetadataPanel({
  slug,
  category,
  status,
  onSlugChange,
  onCategoryChange,
  onStatusChange,
  slugError,
}: DocMetadataPanelProps) {

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Metadados</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Slug */}
        <div className="space-y-2">
          <Label htmlFor="doc-slug" className="text-sm font-medium">
            Slug
          </Label>
          <Input
            id="doc-slug"
            value={slug}
            onChange={(e) => onSlugChange(e.target.value)}
            placeholder="exemplo-de-slug"
            className={cn(slugError && "border-destructive")}
          />
          {slugError && (
            <p className="text-xs text-destructive">{slugError}</p>
          )}
          <p className="text-xs text-muted-foreground">
            URL amigável do documento
          </p>
        </div>

        {/* Categoria */}
        <div className="space-y-2">
          <Label htmlFor="doc-category" className="text-sm font-medium">
            Categoria
          </Label>
          <Select value={category} onValueChange={onCategoryChange}>
            <SelectTrigger id="doc-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Infra">Infra</SelectItem>
              <SelectItem value="Sistemas">Sistemas</SelectItem>
              <SelectItem value="Processos">Processos</SelectItem>
              <SelectItem value="Segurança">Segurança</SelectItem>
              <SelectItem value="Geral">Geral</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Status</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="draft"
                checked={status === "draft"}
                onChange={() => onStatusChange("draft")}
                className="size-4"
              />
              <span className="text-sm">Rascunho</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="published"
                checked={status === "published"}
                onChange={() => onStatusChange("published")}
                className="size-4"
              />
              <span className="text-sm">Publicado</span>
            </label>
          </div>
        </div>

        {/* Visibilidade (placeholder) */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Visibilidade</Label>
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder="Em breve" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="internal">Interno</SelectItem>
              <SelectItem value="team">Time</SelectItem>
              <SelectItem value="private">Privado</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Funcionalidade em desenvolvimento
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
