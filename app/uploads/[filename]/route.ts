import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params

    // Validar nome do arquivo (prevenir path traversal)
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      return NextResponse.json(
        { error: "Nome de arquivo inválido" },
        { status: 400 }
      )
    }

    // Caminho do arquivo
    const uploadsDir = join(process.cwd(), "public", "uploads")
    const filepath = join(uploadsDir, filename)

    // Verificar se o arquivo existe
    if (!existsSync(filepath)) {
      console.error("Arquivo não encontrado:", filepath)
      return NextResponse.json(
        { error: "Arquivo não encontrado" },
        { status: 404 }
      )
    }

    // Validar que o caminho está dentro do diretório de uploads
    if (!filepath.startsWith(uploadsDir)) {
      return NextResponse.json(
        { error: "Caminho inválido" },
        { status: 400 }
      )
    }

    // Ler arquivo
    const fileBuffer = await readFile(filepath)

    // Determinar tipo MIME baseado na extensão
    const extension = filename.substring(filename.lastIndexOf(".")).toLowerCase()
    const mimeTypes: Record<string, string> = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".bmp": "image/bmp",
      ".svg": "image/svg+xml",
      ".pdf": "application/pdf",
      ".txt": "text/plain",
      ".csv": "text/csv",
      ".doc": "application/msword",
      ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".xls": "application/vnd.ms-excel",
      ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }

    const contentType = mimeTypes[extension] || "application/octet-stream"

    // Retornar arquivo
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error: any) {
    console.error("Erro ao servir arquivo:", error)
    return NextResponse.json(
      { error: "Erro interno ao servir arquivo" },
      { status: 500 }
    )
  }
}
