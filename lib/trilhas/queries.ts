import { prisma } from "@/lib/prisma";

export async function getTrilhasCategories() {
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
  });
}

export async function getTrilhasPosts(params: { q?: string; cat?: string }) {
  const q = (params.q ?? "").trim();
  const cat = (params.cat ?? "").trim();

  return prisma.updatePost.findMany({
    where: {
      status: "PUBLISHED",
      ...(cat
        ? {
            category: { slug: cat },
          }
        : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { excerpt: { contains: q, mode: "insensitive" } },
              { content: { contains: q, mode: "insensitive" } }, // opcional (pode pesar)
            ],
          }
        : {}),
    },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      updatedAt: true,
      category: { select: { name: true, slug: true, color: true } },
    },
  });
}

export async function getTrilhasPostBySlug(slug: string) {
  return prisma.updatePost.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      updatedAt: true,
      order: true,
      category: {
        select: {
          name: true,
          slug: true,
          color: true,
          posts: {
            where: { status: "PUBLISHED" },
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              slug: true,
              order: true,
            },
          },
        },
      },
      attachments: {
        select: {
          id: true,
          filename: true,
          url: true,
          mimeType: true,
          size: true,
        },
      },
    },
  });
}
