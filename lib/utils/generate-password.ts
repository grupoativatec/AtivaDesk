import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/crypto/encrypt"

/**
 * Gera uma senha única no formato *At + 6 dígitos aleatórios
 * Exemplo: *At630325
 */
export async function generateUniquePassword(): Promise<string> {
  const MAX_ATTEMPTS = 100 // Limite de tentativas para evitar loop infinito
  
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    // Gerar 6 dígitos aleatórios
    const randomDigits = Math.floor(100000 + Math.random() * 900000).toString()
    const password = `*At${randomDigits}`
    
    // Verificar se a senha já existe no banco
    const exists = await checkPasswordExists(password)
    
    if (!exists) {
      return password
    }
  }
  
  // Se chegou aqui, não conseguiu gerar uma senha única após muitas tentativas
  // Isso é muito improvável, mas vamos gerar uma com timestamp para garantir unicidade
  const timestamp = Date.now().toString().slice(-6)
  return `*At${timestamp}`
}

/**
 * Verifica se uma senha (não criptografada) já existe no banco
 */
async function checkPasswordExists(password: string): Promise<boolean> {
  try {
    // Buscar todos os colaboradores com senha
    const colaboradores = await prisma.colaboradorExterno.findMany({
      where: {
        senha: {
          not: null,
        },
      },
      select: {
        senha: true,
      },
    })
    
    // Descriptografar e verificar se alguma corresponde
    for (const colaborador of colaboradores) {
      if (colaborador.senha) {
        try {
          const decryptedPassword = decrypt(colaborador.senha)
          if (decryptedPassword === password) {
            return true
          }
        } catch (error) {
          // Se não conseguir descriptografar, ignora (pode ser senha antiga ou corrompida)
          console.warn("Erro ao descriptografar senha para verificação:", error)
        }
      }
    }
    
    return false
  } catch (error) {
    console.error("Erro ao verificar senha existente:", error)
    // Em caso de erro, assume que não existe para não bloquear a criação
    return false
  }
}
