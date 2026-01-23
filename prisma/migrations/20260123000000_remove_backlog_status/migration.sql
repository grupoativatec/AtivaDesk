-- Atualizar todas as tarefas com status BACKLOG para TODO
UPDATE "Task" SET "status" = 'TODO' WHERE "status" = 'BACKLOG';

-- Remover o default da coluna temporariamente
ALTER TABLE "Task" ALTER COLUMN "status" DROP DEFAULT;

-- Remover BACKLOG do enum TaskStatus
-- Primeiro, criar um novo enum sem BACKLOG
DO $$ BEGIN
    CREATE TYPE "TaskStatus_new" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Alterar a coluna para usar o novo enum
ALTER TABLE "Task" ALTER COLUMN "status" TYPE "TaskStatus_new" USING ("status"::text::"TaskStatus_new");

-- Dropar o enum antigo
DROP TYPE "TaskStatus";

-- Renomear o novo enum para o nome original
ALTER TYPE "TaskStatus_new" RENAME TO "TaskStatus";

-- Adicionar o novo default (TODO)
ALTER TABLE "Task" ALTER COLUMN "status" SET DEFAULT 'TODO';
