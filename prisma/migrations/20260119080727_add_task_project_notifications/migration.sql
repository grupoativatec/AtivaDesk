-- Adicionar novos tipos de notificação ao enum
DO $$ BEGIN
    ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'TASK_CREATED';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'TASK_STATUS_CHANGED';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'TASK_UPDATED';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'TASK_ASSIGNED';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'PROJECT_CREATED';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'PROJECT_TASK_ADDED';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'PROJECT_UPDATED';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Adicionar coluna createdById na tabela Project
ALTER TABLE "Project" 
ADD COLUMN IF NOT EXISTS "createdById" TEXT;

-- Adicionar foreign key para createdById
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Project_createdById_fkey'
    ) THEN
        ALTER TABLE "Project" 
        ADD CONSTRAINT "Project_createdById_fkey" 
        FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Adicionar índice para createdById
CREATE INDEX IF NOT EXISTS "Project_createdById_idx" ON "Project"("createdById");

-- Adicionar colunas taskId e projectId na tabela Notification
ALTER TABLE "Notification" 
ADD COLUMN IF NOT EXISTS "taskId" TEXT;

ALTER TABLE "Notification" 
ADD COLUMN IF NOT EXISTS "projectId" TEXT;

-- Adicionar foreign keys para taskId e projectId
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Notification_taskId_fkey'
    ) THEN
        ALTER TABLE "Notification" 
        ADD CONSTRAINT "Notification_taskId_fkey" 
        FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Notification_projectId_fkey'
    ) THEN
        ALTER TABLE "Notification" 
        ADD CONSTRAINT "Notification_projectId_fkey" 
        FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Adicionar índices para taskId e projectId
CREATE INDEX IF NOT EXISTS "Notification_taskId_idx" ON "Notification"("taskId");
CREATE INDEX IF NOT EXISTS "Notification_projectId_idx" ON "Notification"("projectId");
