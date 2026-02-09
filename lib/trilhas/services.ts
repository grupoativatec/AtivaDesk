
import { prisma } from "@/lib/prisma"
import { UpdatePostStatus } from "../generated/prisma/enums"

export type ListPostsFilters = {
    q?: string
    cat?: string
    status?: UpdatePostStatus | "all"
    pinned?: boolean
}

export type CreateCategoryData = {
  name: string
  slug?: string
  color?: string
  order?: number
  isActive?: boolean
}

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
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

export type CreateFeedbackData = {
    postId: string
    rating: number
    comment?: string
}

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

        const posts = await prisma.updatePost.findMany({
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
                feedbacks: {
                    select: { rating: true }
                }
            },
        })

        return posts.map(post => {
            const feedbackCount = post.feedbacks.length
            const avgRating = feedbackCount > 0 
                ? post.feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbackCount
                : 0

            const { feedbacks, ...rest } = post
            return {
                ...rest,
                stats: {
                    avgRating,
                    feedbackCount
                }
            }
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

    async createCategory(data: CreateCategoryData) {
        const name = data.name?.trim()
        if (!name) throw new Error("Informe o nome da categoria")

        const slug = (data.slug?.trim() || slugify(name))
        if (!slug) throw new Error("Slug inválido")

        // checa slug duplicado
        const existing = await prisma.updateCategory.findUnique({
            where: { slug },
            select: { id: true },
        })
        if (existing) throw new Error("Slug already in use")

        // define próxima ordem se não vier
        let order = data.order
        if (order === undefined || order === null) {
            const last = await prisma.updateCategory.findFirst({
            orderBy: { order: "desc" },
            select: { order: true },
            })
            order = (last?.order ?? 0) + 1
        }

        return prisma.updateCategory.create({
            data: {
            name,
            slug,
            color: data.color ?? "#64748b", // defaultzinho (ajuste se quiser)
            order,
            isActive: data.isActive ?? true,
            },
            select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            order: true,
            },
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
    },

    async createFeedback(data: CreateFeedbackData) {
        return prisma.updatePostFeedback.create({
            data: {
                postId: data.postId,
                rating: data.rating,
                comment: data.comment,
            },
        })
    },

    async listFeedbacks(postId?: string) {
        return prisma.updatePostFeedback.findMany({
            where: postId ? { postId } : undefined,
            include: {
                post: {
                    select: {
                        title: true,
                        slug: true,
                        category: {
                            select: {
                                name: true,
                                color: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        })
    }
}
