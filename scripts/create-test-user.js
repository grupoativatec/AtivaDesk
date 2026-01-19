require('dotenv/config')
const bcrypt = require('bcrypt')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require('../lib/generated/prisma/client')
const { Pool } = require('pg')

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function createTestUser() {
  try {
    const email = 'teste@grupoativa.net'
    const password = 'teste123'
    const name = 'Usuário Teste'
    const role = 'ADMIN'

    // Verifica se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      console.log('⚠ Usuário já existe. Atualizando...')
      
      // Atualiza a senha e o role
      const hash = await bcrypt.hash(password, 12)
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          password: hash,
          role: role,
          name: name,
        },
      })
      
      console.log('✓ Usuário atualizado com sucesso!')
      console.log(`  Email: ${email}`)
      console.log(`  Senha: ${password}`)
      console.log(`  Role: ${role}`)
    } else {
      // Cria novo usuário
      const hash = await bcrypt.hash(password, 12)
      
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hash,
          role: role,
        },
      })

      console.log('✓ Usuário criado com sucesso!')
      console.log(`  ID: ${user.id}`)
      console.log(`  Email: ${email}`)
      console.log(`  Senha: ${password}`)
      console.log(`  Role: ${role}`)
    }
  } catch (error) {
    console.error('✗ Erro ao criar usuário:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

createTestUser()
