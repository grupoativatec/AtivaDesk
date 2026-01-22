"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ProjectListShell } from "@/components/features/projects/admin/ProjectListShell"
import { CreateProjectModal } from "@/components/features/projects/admin/CreateProjectModal"
import { EditProjectModal } from "@/components/features/projects/admin/EditProjectModal"
import { ProjectListItem } from "@/components/features/projects/admin/project.types"
import { updateProject } from "@/lib/api/projects"
import { toast } from "sonner"

export default function AdminProjectsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectListItem | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCreateSuccess = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handleEdit = (project: ProjectListItem) => {
    setSelectedProject(project)
    setIsEditModalOpen(true)
  }

  const handleEditSuccess = () => {
    setRefreshKey((prev) => prev + 1)
    setIsEditModalOpen(false)
    setSelectedProject(null)
  }

  const handleArchive = async (project: ProjectListItem) => {
    const newStatus = project.status === "ARCHIVED" ? "ACTIVE" : "ARCHIVED"
    const action = newStatus === "ARCHIVED" ? "arquivar" : "desarquivar"

    try {
      const loadingToast = toast.loading(
        `${action === "arquivar" ? "Arquivando" : "Desarquivando"} projeto...`
      )
      await updateProject(project.id, {
        status: newStatus,
      })
      toast.dismiss(loadingToast)
      toast.success(`Projeto ${action === "arquivar" ? "arquivado" : "desarquivado"} com sucesso!`)
      setRefreshKey((prev) => prev + 1)
    } catch (error) {
      console.error("Erro ao arquivar projeto:", error)
      const message = error instanceof Error ? error.message : `Erro ao ${action} projeto`
      toast.error(message)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full flex flex-col h-full"
    >
      {/* Conteúdo principal */}
      <div className="flex-1 overflow-auto">
        <ProjectListShell
          key={refreshKey}
          onCreateProject={() => setIsCreateModalOpen(true)}
          onEditProject={handleEdit}
          onArchiveProject={handleArchive}
        />
      </div>

      {/* Modais */}
      <CreateProjectModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleCreateSuccess}
      />
      <EditProjectModal
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open)
          if (!open) {
            setSelectedProject(null)
          }
        }}
        project={selectedProject}
        onSuccess={handleEditSuccess}
      />
    </motion.div>
  )
}

