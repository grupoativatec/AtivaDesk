"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { ProjectDetailShell } from "@/components/features/projects/admin/detail/ProjectDetailShell"
import { EditProjectModal } from "@/components/features/projects/admin/EditProjectModal"
import { CreateTaskModal } from "@/components/features/admin/tasks/CreateTaskModal"
import { ProjectListItem } from "@/components/features/projects/admin/project.types"

export default function AdminProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectListItem | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleEdit = (project: ProjectListItem) => {
    setSelectedProject(project)
    setIsEditModalOpen(true)
  }

  const handleEditSuccess = () => {
    setRefreshKey((prev) => prev + 1)
    setIsEditModalOpen(false)
    setSelectedProject(null)
  }

  const handleCreateTask = () => {
    setIsCreateTaskModalOpen(true)
  }

  const handleCreateTaskSuccess = () => {
    setRefreshKey((prev) => prev + 1)
    setIsCreateTaskModalOpen(false)
  }

  return (
    <>
      <ProjectDetailShell
        key={refreshKey}
        projectId={projectId}
        onEdit={handleEdit}
        onCreateTask={handleCreateTask}
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

      <CreateTaskModal
        open={isCreateTaskModalOpen}
        onOpenChange={setIsCreateTaskModalOpen}
        defaultProjectId={projectId}
        onSuccess={handleCreateTaskSuccess}
      />
    </>
  )
}

