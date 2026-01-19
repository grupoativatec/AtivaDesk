-- Criar enum TicketUnit se não existir
DO $$ BEGIN
    CREATE TYPE "TicketUnit" AS ENUM ('ITJ', 'SFS', 'FOZ', 'DIO', 'AOL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Adicionar colunas na tabela Ticket se não existirem
DO $$ BEGIN
    -- Adicionar inProgressAt
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Ticket' AND column_name = 'inProgressAt'
    ) THEN
        ALTER TABLE "Ticket" ADD COLUMN "inProgressAt" TIMESTAMP(3);
    END IF;

    -- Adicionar timeSpentMinutes
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Ticket' AND column_name = 'timeSpentMinutes'
    ) THEN
        ALTER TABLE "Ticket" ADD COLUMN "timeSpentMinutes" INTEGER;
    END IF;

    -- Adicionar unit
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Ticket' AND column_name = 'unit'
    ) THEN
        ALTER TABLE "Ticket" ADD COLUMN "unit" "TicketUnit";
    END IF;
END $$;

-- Adicionar índice em Ticket.unit se não existir
CREATE INDEX IF NOT EXISTS "Ticket_unit_idx" ON "Ticket"("unit");

-- Adicionar índice único em User.googleId se não existir (conforme schema)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'User' AND indexname = 'User_googleId_key'
    ) THEN
        CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId") WHERE "googleId" IS NOT NULL;
    END IF;
END $$;

-- Tornar Task.projectId opcional (permitir NULL)
ALTER TABLE "Task" ALTER COLUMN "projectId" DROP NOT NULL;

-- Recriar foreign keys se necessário
-- TaskActivityEvent.actorId - remover e recriar para garantir definição correta
DO $$ BEGIN
    -- Remover constraint antiga se existir
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'TaskActivityEvent_actorId_fkey'
    ) THEN
        ALTER TABLE "TaskActivityEvent" DROP CONSTRAINT "TaskActivityEvent_actorId_fkey";
    END IF;
    
    -- Adicionar constraint com definição correta
    ALTER TABLE "TaskActivityEvent" 
    ADD CONSTRAINT "TaskActivityEvent_actorId_fkey" 
    FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- TimeEntry.userId - remover e recriar para garantir definição correta
DO $$ BEGIN
    -- Remover constraint antiga se existir
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'TimeEntry_userId_fkey'
    ) THEN
        ALTER TABLE "TimeEntry" DROP CONSTRAINT "TimeEntry_userId_fkey";
    END IF;
    
    -- Adicionar constraint com definição correta
    ALTER TABLE "TimeEntry" 
    ADD CONSTRAINT "TimeEntry_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Task.projectId (com ON DELETE SET NULL já que agora é opcional)
DO $$ BEGIN
    -- Remover constraint antiga se existir
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Task_projectId_fkey'
    ) THEN
        ALTER TABLE "Task" DROP CONSTRAINT "Task_projectId_fkey";
    END IF;
    
    -- Adicionar nova constraint com ON DELETE SET NULL
    ALTER TABLE "Task" 
    ADD CONSTRAINT "Task_projectId_fkey" 
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
END $$;
