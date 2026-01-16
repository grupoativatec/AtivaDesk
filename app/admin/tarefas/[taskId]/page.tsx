import { notFound } from "next/navigation"
import { TaskDetailsContainer } from "@/components/features/admin/tasks/TaskDetailsContainer"
import { getTaskById } from "@/lib/api"
import { ApiClientError } from "@/lib/api/client"

interface TaskDetailPageProps {
  params: Promise<{ taskId: string }>
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { taskId } = await params

  try {
    const task = await getTaskById(taskId)
    return (
      <div className="w-full flex flex-col h-full">
        <TaskDetailsContainer initialTask={task} />
      </div>
    )
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      notFound()
    }
    // Re-throw para mostrar erro genérico
    throw error
  }
}
