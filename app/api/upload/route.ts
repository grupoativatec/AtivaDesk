import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { writeFile, mkdir } from "fs/promises"
import { join, extname } from "path"
import { existsSync } from "fs"

// Função para validar magic bytes (assinatura do arquivo)
function validateMagicBytes(magicBytes: Buffer, extension: string, mimeType: string): boolean {
  // Magic bytes para diferentes tipos de arquivo
  const magicSignatures: Record<string, (bytes: Buffer) => boolean> = {
    ".jpg": (bytes) => bytes.slice(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])),
    ".jpeg": (bytes) => bytes.slice(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])),
    ".png": (bytes) => bytes.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    ".gif": (bytes) => bytes.slice(0, 4).equals(Buffer.from([0x47, 0x49, 0x46, 0x38])),
    ".webp": (bytes) => {
      // WebP: começa com "RIFF" e depois tem "WEBP" na posição 8
      if (bytes.length < 12) return false
      return (
        bytes.slice(0, 4).toString("ascii") === "RIFF" &&
        bytes.slice(8, 12).toString("ascii") === "WEBP"
      )
    },
    ".bmp": (bytes) => bytes.slice(0, 2).toString("ascii") === "BM",
    ".svg": (bytes) => {
      // SVG pode começar com <?xml ou <svg
      const start = bytes.slice(0, 100).toString("utf-8").trim()
      return start.startsWith("<?xml") || start.startsWith("<svg")
    },
    ".pdf": (bytes) => bytes.slice(0, 4).toString("ascii") === "%PDF",
  }

  // Para imagens e PDFs, validar magic bytes
  if (magicSignatures[extension]) {
    return magicSignatures[extension](magicBytes)
  }

  // Para documentos Office, verificar apenas extensão e MIME type
  // (magic bytes de Office são complexos e podem variar, mas validamos extensão e MIME)
  if ([".doc", ".docx", ".xls", ".xlsx"].includes(extension)) {
    return true // Confiar na validação de extensão e MIME type
  }

  // Para arquivos de texto, aceitar se passar nas outras validações
  if ([".txt", ".csv"].includes(extension)) {
    return true
  }

  return false
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      )
    }

    // Validar tamanho (10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Máximo: 10MB" },
        { status: 400 }
      )
    }

    // Validar que o arquivo não está vazio
    if (file.size === 0) {
      return NextResponse.json(
        { error: "Arquivo vazio não é permitido" },
        { status: 400 }
      )
    }

    // Validar extensão do arquivo
    const extension = extname(file.name).toLowerCase()
    const allowedExtensions = [
      // Imagens
      ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg",
      // Documentos
      ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt", ".csv",
    ]

    if (!allowedExtensions.includes(extension)) {
      return NextResponse.json(
        { error: "Extensão de arquivo não permitida" },
        { status: 400 }
      )
    }

    // Validar tipo MIME
    const allowedTypes = [
      // Imagens
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/bmp",
      "image/svg+xml",
      // Documentos
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "text/csv",
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de arquivo não permitido" },
        { status: 400 }
      )
    }

    // Validar correspondência entre extensão e tipo MIME
    const extensionToMime: Record<string, string[]> = {
      ".jpg": ["image/jpeg"],
      ".jpeg": ["image/jpeg"],
      ".png": ["image/png"],
      ".gif": ["image/gif"],
      ".webp": ["image/webp"],
      ".bmp": ["image/bmp"],
      ".svg": ["image/svg+xml"],
      ".pdf": ["application/pdf"],
      ".doc": ["application/msword"],
      ".docx": ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      ".xls": ["application/vnd.ms-excel"],
      ".xlsx": ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
      ".txt": ["text/plain"],
      ".csv": ["text/csv", "text/plain"],
    }

    const expectedMimes = extensionToMime[extension]
    if (!expectedMimes || !expectedMimes.includes(file.type)) {
      return NextResponse.json(
        { error: "Extensão do arquivo não corresponde ao tipo MIME" },
        { status: 400 }
      )
    }

    // Validar magic bytes (primeiros bytes do arquivo)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const magicBytes = buffer.slice(0, 12)

    // Verificar magic bytes conhecidos
    const isValidMagicBytes = validateMagicBytes(magicBytes, extension, file.type)
    if (!isValidMagicBytes) {
      console.warn("Magic bytes não correspondem:", {
        extension,
        mimeType: file.type,
        magicBytes: Array.from(magicBytes).map(b => b.toString(16).padStart(2, '0')).join(' '),
        filename: file.name
      })
      // Para imagens, ainda permitir se a extensão e MIME type estão corretos
      // (alguns formatos podem ter variações nos magic bytes)
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "Arquivo corrompido ou tipo inválido detectado" },
          { status: 400 }
        )
      }
    }

    // Criar diretório de uploads se não existir
    const uploadsDir = join(process.cwd(), "public", "uploads")
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Sanitizar nome do arquivo (remover caracteres perigosos)
    const sanitizedName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .substring(0, 100) // Limitar tamanho do nome

    // Gerar nome único e seguro
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 15)
    const safeExtension = extension.toLowerCase()
    const filename = `${timestamp}-${randomStr}${safeExtension}`
    const filepath = join(uploadsDir, filename)

    // Validar que o caminho final está dentro do diretório de uploads (prevenir path traversal)
    const resolvedPath = join(uploadsDir, filename)
    if (!resolvedPath.startsWith(uploadsDir)) {
      return NextResponse.json(
        { error: "Caminho de arquivo inválido" },
        { status: 400 }
      )
    }

    // Salvar arquivo (usar o buffer já criado anteriormente)
    await writeFile(filepath, buffer)
    
    // Verificar se o arquivo foi salvo corretamente
    const fileExists = existsSync(filepath)
    if (!fileExists) {
      return NextResponse.json(
        { error: "Erro ao salvar arquivo no servidor" },
        { status: 500 }
      )
    }

    // Retornar URL
    const url = `/uploads/${filename}`

    return NextResponse.json({
      ok: true,
      url,
      filename: file.name,
      size: file.size,
      mimeType: file.type,
    })
  } catch (error: any) {
    console.error("Erro ao fazer upload:", error)
    console.error("Stack trace:", error.stack)
    return NextResponse.json(
      { error: error.message || "Erro interno ao fazer upload" },
      { status: 500 }
    )
  }
}
