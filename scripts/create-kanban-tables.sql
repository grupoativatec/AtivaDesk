-- Script para criar as tabelas do Kanban manualmente
-- Execute este script no PostgreSQL se houver problemas com migrações

-- Criar enum KanbanStatus se não existir
DO $$ BEGIN
    CREATE TYPE "KanbanStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Criar enum KanbanMemberRole se não existir
DO $$ BEGIN
    CREATE TYPE "KanbanMemberRole" AS ENUM ('VIEWER', 'EDITOR', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Criar tabela KanbanBoard
CREATE TABLE IF NOT EXISTS "KanbanBoard" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "projectId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KanbanBoard_pkey" PRIMARY KEY ("id")
);

-- Criar tabela KanbanColumn
CREATE TABLE IF NOT EXISTS "KanbanColumn" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "status" "KanbanStatus" NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KanbanColumn_pkey" PRIMARY KEY ("id")
);

-- Criar tabela KanbanCard
CREATE TABLE IF NOT EXISTS "KanbanCard" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "columnId" TEXT NOT NULL,
    "taskId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" "TaskPriority",
    "dueDate" TIMESTAMP(3),
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "assigneeId" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KanbanCard_pkey" PRIMARY KEY ("id")
);

-- Criar tabela KanbanMember
CREATE TABLE IF NOT EXISTS "KanbanMember" (
    "boardId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "KanbanMemberRole" NOT NULL DEFAULT 'EDITOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KanbanMember_pkey" PRIMARY KEY ("boardId", "userId")
);

-- Criar índices
CREATE INDEX IF NOT EXISTS "KanbanBoard_projectId_idx" ON "KanbanBoard"("projectId");
CREATE INDEX IF NOT EXISTS "KanbanBoard_createdById_idx" ON "KanbanBoard"("createdById");
CREATE INDEX IF NOT EXISTS "KanbanBoard_updatedAt_idx" ON "KanbanBoard"("updatedAt");

CREATE UNIQUE INDEX IF NOT EXISTS "KanbanColumn_boardId_status_key" ON "KanbanColumn"("boardId", "status");
CREATE INDEX IF NOT EXISTS "KanbanColumn_boardId_order_idx" ON "KanbanColumn"("boardId", "order");

CREATE UNIQUE INDEX IF NOT EXISTS "KanbanCard_boardId_taskId_key" ON "KanbanCard"("boardId", "taskId");
CREATE INDEX IF NOT EXISTS "KanbanCard_boardId_columnId_order_idx" ON "KanbanCard"("boardId", "columnId", "order");
CREATE INDEX IF NOT EXISTS "KanbanCard_taskId_idx" ON "KanbanCard"("taskId");
CREATE INDEX IF NOT EXISTS "KanbanCard_assigneeId_idx" ON "KanbanCard"("assigneeId");

CREATE INDEX IF NOT EXISTS "KanbanMember_userId_idx" ON "KanbanMember"("userId");

-- Adicionar foreign keys
DO $$ BEGIN
    ALTER TABLE "KanbanBoard" ADD CONSTRAINT "KanbanBoard_projectId_fkey" 
        FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "KanbanBoard" ADD CONSTRAINT "KanbanBoard_createdById_fkey" 
        FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "KanbanColumn" ADD CONSTRAINT "KanbanColumn_boardId_fkey" 
        FOREIGN KEY ("boardId") REFERENCES "KanbanBoard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "KanbanCard" ADD CONSTRAINT "KanbanCard_boardId_fkey" 
        FOREIGN KEY ("boardId") REFERENCES "KanbanBoard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "KanbanCard" ADD CONSTRAINT "KanbanCard_columnId_fkey" 
        FOREIGN KEY ("columnId") REFERENCES "KanbanColumn"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "KanbanCard" ADD CONSTRAINT "KanbanCard_taskId_fkey" 
        FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "KanbanCard" ADD CONSTRAINT "KanbanCard_assigneeId_fkey" 
        FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "KanbanMember" ADD CONSTRAINT "KanbanMember_boardId_fkey" 
        FOREIGN KEY ("boardId") REFERENCES "KanbanBoard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "KanbanMember" ADD CONSTRAINT "KanbanMember_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
