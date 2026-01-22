"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { DocsShell } from "@/components/features/docs/DocsShell"
import { DocCard } from "@/components/features/docs/DocCard"
import { useDocsStore } from "@/lib/stores/docs-store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Clock } from "lucide-react"
import Link from "next/link"

export default function RecentDocsPage() {
  const getRecentDocs = useDocsStore((state) => state.getRecentDocs)
  const recentDocs = useMemo(() => getRecentDocs(10), [getRecentDocs])

  return (
    <DocsShell pageTitle="Recentes">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {recentDocs.length === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center justify-center gap-4">
            <div className="rounded-full bg-muted p-4">
              <Clock className="size-8 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                Nenhum documento recente
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Documentos editados recentemente aparecerão aqui. Crie ou edite um
                documento para começar.
              </p>
            </div>
            <Button asChild variant="outline" className="mt-2">
              <Link href="/admin/docs/new">
                <FileText className="size-4 mr-2" />
                Criar documento
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {recentDocs.map((doc) => (
            <DocCard key={doc.id} doc={doc} />
          ))}
        </div>
      )}
      </motion.div>
    </DocsShell>
  )
}
