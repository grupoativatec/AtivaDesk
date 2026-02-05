"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export type TrilhasStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED"

export function TrilhasMetadataPanel(props: {
    slug: string
    onSlugChange: (v: string) => void
    slugError?: string

    status: TrilhasStatus
    onStatusChange: (v: TrilhasStatus) => void

    pinned: boolean
    onPinnedChange: (v: boolean) => void

    categorySlug: string
    onCategorySlugChange: (v: string) => void
    categories: Array<{ id: string; name: string; slug: string; color: string | null }>
}) {
    const {
        slug, onSlugChange, slugError,
        status, onStatusChange,
        pinned, onPinnedChange,
        categorySlug, onCategorySlugChange,
        categories
    } = props

    return (
        <div className="space-y-5">
            <div className="space-y-2">
                <Label className="text-sm">Slug</Label>
                <Input value={slug} onChange={(e) => onSlugChange(e.target.value)} />
                {slugError ? <p className="text-xs text-destructive">{slugError}</p> : null}
            </div>

            <div className="space-y-2">
                <Label className="text-sm">Categoria</Label>
                <Select value={categorySlug} onValueChange={onCategorySlugChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((c) => (
                            <SelectItem key={c.id} value={c.slug}>
                                {c.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label className="text-sm">Status</Label>
                <Select value={status} onValueChange={(v) => onStatusChange(v as TrilhasStatus)}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="DRAFT">DRAFT</SelectItem>
                        <SelectItem value="PUBLISHED">PUBLISHED</SelectItem>
                        <SelectItem value="ARCHIVED">ARCHIVED</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center justify-between rounded-md border border-border/50 p-3">
                <div>
                    <p className="text-sm font-medium text-foreground">Fixar post</p>
                    <p className="text-xs text-muted-foreground">Fica no topo da listagem</p>
                </div>
                <Switch checked={pinned} onCheckedChange={onPinnedChange} />
            </div>
        </div>
    )
}
