"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { X, Upload, Image as ImageIcon, File } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Attachment {
  id: string
  file: File
  preview?: string
}

interface AttachmentUploadProps {
  attachments: Attachment[]
  onAttachmentsChange: (attachments: Attachment[]) => void
  maxSize?: number // em bytes
  maxFiles?: number
}

export function AttachmentUpload({
  attachments,
  onAttachmentsChange,
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 10,
}: AttachmentUploadProps) {
  const [errors, setErrors] = useState<string[]>([])

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setErrors([])
      const newErrors: string[] = []

      // Verificar limite de arquivos
      if (attachments.length + acceptedFiles.length > maxFiles) {
        newErrors.push(`Máximo de ${maxFiles} arquivos permitidos`)
        setErrors(newErrors)
        return
      }

      const newAttachments: Attachment[] = []

      acceptedFiles.forEach((file) => {
        // Verificar tamanho
        if (file.size > maxSize) {
          newErrors.push(`${file.name} excede o tamanho máximo de ${(maxSize / 1024 / 1024).toFixed(0)}MB`)
          return
        }

        const id = `${Date.now()}-${Math.random()}`
        const attachment: Attachment = {
          id,
          file,
          preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
        }
        newAttachments.push(attachment)
      })

      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file, errors }: any) => {
          errors.forEach((error: any) => {
            if (error.code === "file-too-large") {
              newErrors.push(`${file.name} é muito grande`)
            } else if (error.code === "file-invalid-type") {
              newErrors.push(`${file.name} tem tipo inválido`)
            }
          })
        })
      }

      if (newErrors.length > 0) {
        setErrors(newErrors)
      }

      if (newAttachments.length > 0) {
        onAttachmentsChange([...attachments, ...newAttachments])
      }
    },
    [attachments, maxSize, maxFiles, onAttachmentsChange]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxSize,
    maxFiles: maxFiles - attachments.length,
  })

  const removeAttachment = (id: string) => {
    const updated = attachments.filter((att) => {
      if (att.id === id && att.preview) {
        URL.revokeObjectURL(att.preview)
      }
      return att.id !== id
    })
    onAttachmentsChange(updated)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-3">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-input hover:border-primary/50 hover:bg-accent/50",
          "dark:bg-input/30"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="size-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm font-medium mb-1">
          {isDragActive ? "Solte os arquivos aqui" : "Arraste arquivos ou clique para selecionar"}
        </p>
        <p className="text-xs text-muted-foreground">
          Imagens, PDFs, documentos (máx. {(maxSize / 1024 / 1024).toFixed(0)}MB cada)
        </p>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="text-sm text-destructive space-y-1">
          {errors.map((error, idx) => (
            <p key={idx}>• {error}</p>
          ))}
        </div>
      )}

      {/* Preview dos anexos */}
      {attachments.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="relative group border rounded-lg overflow-hidden bg-muted/30"
            >
              {attachment.preview ? (
                <div className="aspect-square relative">
                  <img
                    src={attachment.preview}
                    alt={attachment.file.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>
              ) : (
                <div className="aspect-square flex items-center justify-center">
                  <File className="size-8 text-muted-foreground" />
                </div>
              )}
              
              <div className="p-2">
                <p className="text-xs font-medium truncate" title={attachment.file.name}>
                  {attachment.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(attachment.file.size)}
                </p>
              </div>

              <Button
                type="button"
                variant="destructive"
                size="icon-sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeAttachment(attachment.id)}
              >
                <X className="size-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
