
import { prisma } from "@/lib/prisma"
import { UpdatePostStatus } from "../generated/prisma/enums"

export type ListPostsFilters = {
    q?: string
    cat?: string
    status?: UpdatePostStatus | "all"
    pinned?: boolean
}

export type CreatePostData = {
    title: string
    excerpt: string
    content: string
    slug: string
    categorySlug: string
    status: UpdatePostStatus
    pinned: boolean
}

export type UpdatePostData = Partial<CreatePostData>

export const TrilhasService = {
    async listPosts(filters: ListPostsFilters) {
        const { q, cat, status, pinned } = filters

        const where: any = {}

        if (status && status !== "all") {
            where.status = status
        }

        if (cat && cat !== "all") {
            where.category = { slug: cat }
        }

        if (pinned) {
            where.pinned = true
        }

        if (q) {
            where.OR = [
                { title: { contains: q, mode: "insensitive" } },
                { excerpt: { contains: q, mode: "insensitive" } },
            ]
        }

        return prisma.updatePost.findMany({
            where,
            orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
            select: {
                id: true,
                slug: true,
                title: true,
                excerpt: true,
                updatedAt: true,
                status: true,
                pinned: true,
                category: { select: { name: true, slug: true, color: true } },
            },
        })
    },

    async getPostBySlug(slug: string) {
        return prisma.updatePost.findUnique({
            where: { slug },
            select: {
                id: true,
                slug: true,
                title: true,
                excerpt: true,
                content: true,
                status: true,
                pinned: true,
                updatedAt: true,
                category: { select: { slug: true, name: true, color: true } },
            },
        })
    },

    async checkSlugAvailability(slug: string, excludeId?: string) {
        const existing = await prisma.updatePost.findFirst({
            where: {
                slug,
                id: excludeId ? { not: excludeId } : undefined,
            },
        })
        return !!existing
    },

    async createPost(data: CreatePostData) {
        const category = await prisma.updateCategory.findUnique({
            where: { slug: data.categorySlug },
        })

        if (!category) {
            throw new Error("Category not found")
        }

        const isSlugTaken = await this.checkSlugAvailability(data.slug)
        if (isSlugTaken) {
            throw new Error("Slug already in use")
        }

        return prisma.updatePost.create({
            data: {
                title: data.title,
                excerpt: data.excerpt,
                content: data.content,
                slug: data.slug,
                status: data.status,
                pinned: data.pinned,
                categoryId: category.id,
            },
        })
    },

    async updatePost(id: string, data: UpdatePostData) {
         let categoryId: string | undefined

         if (data.categorySlug) {
             const category = await prisma.updateCategory.findUnique({
                 where: { slug: data.categorySlug },
             })
             if (!category) throw new Error("Category not found")
             categoryId = category.id
         }
         
         if (data.slug) {
             const isSlugTaken = await this.checkSlugAvailability(data.slug, id)
             if (isSlugTaken) throw new Error("Slug already in use")
         }

         return prisma.updatePost.update({
             where: { id },
             data: {
                 title: data.title,
                 excerpt: data.excerpt,
                 content: data.content,
                 slug: data.slug,
                 status: data.status,
                 pinned: data.pinned,
                 categoryId,
             }
         })
    },

    async deletePost(id: string) {
        return prisma.updatePost.delete({
            where: { id }
        })
    },

    async listCategories() {
        return prisma.updateCategory.findMany({
            where: { isActive: true },
            orderBy: [{ order: "asc" }, { name: "asc" }],
            select: {
                id: true,
                name: true,
                slug: true,
                color: true,
                order: true,
            },
        })
    }
}
