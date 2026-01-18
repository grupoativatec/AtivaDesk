-- Converter totalPausedMinutes para totalPausedSeconds
-- Multiplicar valores existentes por 60 para converter minutos em segundos
ALTER TABLE "Ticket" 
ADD COLUMN IF NOT EXISTS "totalPausedSeconds" INTEGER NOT NULL DEFAULT 0;

-- Converter valores existentes (multiplicar por 60)
UPDATE "Ticket" 
SET "totalPausedSeconds" = "totalPausedMinutes" * 60 
WHERE "totalPausedMinutes" IS NOT NULL;

-- Remover a coluna antiga
ALTER TABLE "Ticket" 
DROP COLUMN IF EXISTS "totalPausedMinutes";
