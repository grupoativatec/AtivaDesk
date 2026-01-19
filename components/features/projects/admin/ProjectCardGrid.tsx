"use client"

import { ProjectListItem } from "./project.types"
import { ProjectCard } from "./ProjectCard"

interface ProjectCardGridProps {
  projects: ProjectListItem[]
  onEdit?: (project: ProjectListItem) => void
  onArchive?: (project: ProjectListItem) => void
}

export function ProjectCardGrid({ projects, onEdit, onArchive }: ProjectCardGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onEdit={onEdit}
          onArchive={onArchive}
        />
      ))}
    </div>
  )
}

