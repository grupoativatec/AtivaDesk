require('dotenv/config')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require('../lib/generated/prisma/client')
const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function applyMigration() {
  try {
    const sql = fs.readFileSync(
      path.join(__dirname, '../prisma/migrations/20260120000000_add_kanban_models/migration.sql'),
      'utf8'
    )

    // Remove BOM se existir
    const cleanSql = sql.replace(/^\uFEFF/, '')

    // Executa o SQL completo
    console.log('Executando migração SQL...')
    
    try {
      await prisma.$executeRawUnsafe(cleanSql)
      console.log('✓ Migração aplicada com sucesso!')
    } catch (error) {
      // Se der erro, tenta executar comandos individuais
      console.log('Tentando executar comandos individuais...')
      
      const commands = cleanSql
        .split(/;\s*(?=CREATE|ALTER|DO|CREATE INDEX|CREATE UNIQUE)/i)
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))

      for (const command of commands) {
        if (command.trim()) {
          try {
            await prisma.$executeRawUnsafe(command + (command.endsWith(';') ? '' : ';'))
            console.log('✓ Comando executado')
          } catch (error) {
            // Ignora erros de "já existe"
            if (error.message?.includes('already exists') || 
                error.message?.includes('já existe') ||
                error.message?.includes('duplicate') ||
                error.message?.includes('duplicate_object')) {
              console.log('⚠ Já existe, ignorando')
            } else {
              console.error('✗ Erro:', error.message)
            }
          }
        }
      }
    }

    console.log('Migração concluída!')
  } catch (error) {
    console.error('Erro ao aplicar migração:', error)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

applyMigration()
