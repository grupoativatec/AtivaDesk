"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Doc } from "@/components/features/docs/DocCard"
import { mockDocs } from "@/lib/docs/mock-docs"

interface DocsStore {
  docs: Doc[]
  favoriteDocIds: string[]
  // Actions
  addDoc: (doc: Omit<Doc, "id" | "updatedAt" | "views">) => string
  updateDoc: (id: string, updates: Partial<Doc>) => void
  deleteDoc: (id: string) => void
  archiveDoc: (id: string) => void
  unarchiveDoc: (id: string) => void
  toggleFavorite: (id: string) => void
  incrementViews: (id: string) => void
  getDocBySlug: (slug: string) => Doc | undefined
  getDocById: (id: string) => Doc | undefined
  getRecentDocs: (limit?: number) => Doc[]
  getFavoriteDocs: () => Doc[]
}

export const useDocsStore = create<DocsStore>()(
  persist(
    (set, get) => ({
      docs: mockDocs,
      favoriteDocIds: [],

      addDoc: (newDoc) => {
        const id = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const doc: Doc = {
          ...newDoc,
          id,
          updatedAt: new Date().toISOString(),
          views: 0,
        }
        set((state) => ({
          docs: [...state.docs, doc],
        }))
        return id
      },

      updateDoc: (id, updates) => {
        set((state) => ({
          docs: state.docs.map((doc) =>
            doc.id === id
              ? {
                  ...doc,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : doc
          ),
        }))
      },

      deleteDoc: (id) => {
        set((state) => ({
          docs: state.docs.filter((doc) => doc.id !== id),
        }))
      },

      archiveDoc: (id) => {
        set((state) => ({
          docs: state.docs.map((doc) =>
            doc.id === id ? { ...doc, archived: true } : doc
          ),
        }))
      },

      unarchiveDoc: (id) => {
        set((state) => ({
          docs: state.docs.map((doc) =>
            doc.id === id ? { ...doc, archived: false } : doc
          ),
        }))
      },

      toggleFavorite: (id) => {
        set((state) => {
          const isFavorite = state.favoriteDocIds.includes(id)
          return {
            favoriteDocIds: isFavorite
              ? state.favoriteDocIds.filter((docId) => docId !== id)
              : [...state.favoriteDocIds, id],
          }
        })
      },

      incrementViews: (id) => {
        set((state) => ({
          docs: state.docs.map((doc) =>
            doc.id === id
              ? {
                  ...doc,
                  views: (doc.views || 0) + 1,
                }
              : doc
          ),
        }))
      },

      getDocBySlug: (slug) => {
        const state = get()
        return state.docs.find((doc) => doc.slug === slug)
      },

      getDocById: (id) => {
        const state = get()
        return state.docs.find((doc) => doc.id === id)
      },

      getRecentDocs: (limit = 10) => {
        const state = get()
        return [...state.docs]
          .filter((doc) => !doc.archived)
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
          .slice(0, limit)
      },

      getFavoriteDocs: () => {
        const state = get()
        return state.docs.filter((doc) =>
          state.favoriteDocIds.includes(doc.id)
        )
      },
    }),
    {
      name: "docs-storage",
      version: 1,
    }
  )
)
