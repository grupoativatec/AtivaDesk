-- CreateTable
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'CategoriaColaborador') THEN
        CREATE TABLE "CategoriaColaborador" (
            "id" TEXT NOT NULL,
            "nome" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,

            CONSTRAINT "CategoriaColaborador_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

-- CreateIndex
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'CategoriaColaborador_nome_key') THEN
        CREATE UNIQUE INDEX "CategoriaColaborador_nome_key" ON "CategoriaColaborador"("nome");
    END IF;
END $$;

-- CreateIndex
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'CategoriaColaborador_nome_idx') THEN
        CREATE INDEX "CategoriaColaborador_nome_idx" ON "CategoriaColaborador"("nome");
    END IF;
END $$;

-- CreateTable
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ColaboradorExterno') THEN
        CREATE TABLE "ColaboradorExterno" (
            "id" TEXT NOT NULL,
            "nome" TEXT NOT NULL,
            "email" TEXT,
            "senha" TEXT,
            "departamento" TEXT,
            "categoriaId" TEXT,
            "dataEntrada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "dataSaida" TIMESTAMP(3),
            "ativo" BOOLEAN NOT NULL DEFAULT true,
            "registradoPorId" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,

            CONSTRAINT "ColaboradorExterno_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

-- CreateIndex
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ColaboradorExterno_ativo_idx') THEN
        CREATE INDEX "ColaboradorExterno_ativo_idx" ON "ColaboradorExterno"("ativo");
    END IF;
END $$;

-- CreateIndex
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ColaboradorExterno_dataEntrada_idx') THEN
        CREATE INDEX "ColaboradorExterno_dataEntrada_idx" ON "ColaboradorExterno"("dataEntrada");
    END IF;
END $$;

-- CreateIndex
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ColaboradorExterno_registradoPorId_idx') THEN
        CREATE INDEX "ColaboradorExterno_registradoPorId_idx" ON "ColaboradorExterno"("registradoPorId");
    END IF;
END $$;

-- CreateIndex
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ColaboradorExterno_categoriaId_idx') THEN
        CREATE INDEX "ColaboradorExterno_categoriaId_idx" ON "ColaboradorExterno"("categoriaId");
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'ColaboradorExterno_categoriaId_fkey'
    ) THEN
        ALTER TABLE "ColaboradorExterno" 
        ADD CONSTRAINT "ColaboradorExterno_categoriaId_fkey" 
        FOREIGN KEY ("categoriaId") REFERENCES "CategoriaColaborador"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'ColaboradorExterno_registradoPorId_fkey'
    ) THEN
        ALTER TABLE "ColaboradorExterno" 
        ADD CONSTRAINT "ColaboradorExterno_registradoPorId_fkey" 
        FOREIGN KEY ("registradoPorId") REFERENCES "User"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
