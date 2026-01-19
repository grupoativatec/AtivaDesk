require('dotenv/config')
const bcrypt = require('bcrypt')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require('../lib/generated/prisma/client')
const { Pool } = require('pg')

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function debugUser() {
  try {
    const email = 'teste@grupoativa'
    const password = 'teste123'

    console.log('🔍 Buscando usuário...')
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      console.log('✗ Usuário não encontrado!')
      return
    }

    console.log('✓ Usuário encontrado:')
    console.log(`  ID: ${user.id}`)
    console.log(`  Email: ${user.email}`)
    console.log(`  Nome: ${user.name}`)
    console.log(`  Role: ${user.role}`)
    console.log(`  Tem senha: ${!!user.password}`)
    console.log(`  Hash da senha: ${user.password ? user.password.substring(0, 20) + '...' : 'null'}`)

    if (user.password) {
      console.log('\n🔐 Testando senha...')
      const isValid = await bcrypt.compare(password, user.password)
      console.log(`  Senha "teste123" é válida: ${isValid ? '✓ SIM' : '✗ NÃO'}`)
      
      if (!isValid) {
        console.log('\n⚠ Senha não confere! Vamos recriar o hash...')
        const newHash = await bcrypt.hash(password, 12)
        await prisma.user.update({
          where: { id: user.id },
          data: { password: newHash },
        })
        console.log('✓ Hash atualizado!')
        
        // Testa novamente
        const isValidAfter = await bcrypt.compare(password, newHash)
        console.log(`  Teste após atualização: ${isValidAfter ? '✓ SIM' : '✗ NÃO'}`)
      }
    } else {
      console.log('\n⚠ Usuário não tem senha! Criando...')
      const hash = await bcrypt.hash(password, 12)
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hash },
      })
      console.log('✓ Senha criada!')
      
      // Testa
      const isValid = await bcrypt.compare(password, hash)
      console.log(`  Teste: ${isValid ? '✓ SIM' : '✗ NÃO'}`)
    }
  } catch (error) {
    console.error('✗ Erro:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

debugUser()
