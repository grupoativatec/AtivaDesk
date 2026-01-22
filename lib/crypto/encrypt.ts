import crypto from "crypto"

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 16
const TAG_LENGTH = 16

// Chave de criptografia - em produção, use uma variável de ambiente
// A chave deve ter 32 bytes (256 bits) para AES-256
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default-key-change-in-production-32bytes!!"

function getKey(): Buffer {
  // Garantir que a chave tenha exatamente 32 bytes
  const keyString = ENCRYPTION_KEY.length >= 32 
    ? ENCRYPTION_KEY.slice(0, 32)
    : ENCRYPTION_KEY.padEnd(32, "0")
  
  return crypto.createHash("sha256").update(keyString).digest()
}

export function encrypt(text: string): string {
  if (!text) return ""
  
  const key = getKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")

  const tag = cipher.getAuthTag()

  // Retornar: iv + tag + encrypted (tudo em hex)
  return iv.toString("hex") + ":" + tag.toString("hex") + ":" + encrypted
}

export function decrypt(encryptedText: string): string {
  if (!encryptedText) return ""
  
  try {
    const parts = encryptedText.split(":")
    if (parts.length !== 3) {
      // Se não estiver no formato esperado, pode ser texto não criptografado (migração)
      return encryptedText
    }

    const iv = Buffer.from(parts[0], "hex")
    const tag = Buffer.from(parts[1], "hex")
    const encrypted = parts[2]

    const key = getKey()
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(tag)

    let decrypted = decipher.update(encrypted, "hex", "utf8")
    decrypted += decipher.final("utf8")

    return decrypted
  } catch (error) {
    // Se falhar ao descriptografar, pode ser texto não criptografado
    console.error("Erro ao descriptografar:", error)
    return encryptedText
  }
}
