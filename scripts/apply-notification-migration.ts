import "dotenv/config";
import { prisma } from "../lib/prisma";
import fs from "fs";
import path from "path";

async function main() {
  const migrationPath = path.join(
    __dirname,
    "../prisma/migrations/20260119080727_add_task_project_notifications/migration.sql"
  );
  const migrationSQL = fs.readFileSync(migrationPath, "utf-8");

  // Executar a migration SQL completa
  await prisma.$executeRawUnsafe(migrationSQL);

  console.log("Migration aplicada com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro ao aplicar migration:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
