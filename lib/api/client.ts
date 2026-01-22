/**
 * Cliente HTTP base para chamadas à API
 * Centraliza configuração, autenticação e tratamento de erros
 */

export interface ApiError {
  message: string
  status: number
  code?: string
}

export class ApiClientError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string
  ) {
    super(message)
    this.name = "ApiClientError"
  }
}

/**
 * Configuração base da API
 */
const getBaseURL = async (): Promise<string> => {
  // Client-side: usar URL relativa (Next.js resolve automaticamente)
  if (typeof window !== "undefined") {
    return ""
  }
  
  // Server-side: construir URL absoluta
  // Se NEXT_PUBLIC_API_URL estiver definido, usar ele
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  
  // Tentar obter o host dos headers (Next.js 13+)
  try {
    const { headers } = await import("next/headers")
    const headersList = await headers()
    const host = headersList.get("host")
    const protocol = headersList.get("x-forwarded-proto") || 
                     (process.env.NODE_ENV === "production" ? "https" : "http")
    
    if (host) {
      return `${protocol}://${host}`
    }
  } catch (error) {
    // Se não conseguir importar headers (pode acontecer em alguns contextos)
    // Isso é normal em alguns casos, usar fallback
  }
  
  // Fallback: usar variável de ambiente APP_URL ou NEXT_PUBLIC_APP_URL
  if (process.env.APP_URL) {
    return process.env.APP_URL
  }
  
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  
  // Último fallback: usar localhost apenas em desenvolvimento
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http"
  const host = process.env.VERCEL_URL || 
               process.env.NEXT_PUBLIC_VERCEL_URL || 
               "localhost:3000"
  return `${protocol}://${host}`
}

/**
 * Obtém headers padrão para requisições
 */
async function getHeaders(customHeaders?: HeadersInit): Promise<HeadersInit> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(customHeaders as Record<string, string>),
  }

  // No servidor, passar cookies manualmente
  if (typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers")
      const cookieStore = await cookies()
      const cookieHeader = cookieStore
        .getAll()
        .map((cookie) => `${cookie.name}=${cookie.value}`)
        .join("; ")

      if (cookieHeader) {
        headers["Cookie"] = cookieHeader
      }
    } catch {
      // Se não conseguir importar cookies, continuar sem eles
      // Isso pode acontecer em alguns contextos
    }
  }

  return headers
}

/**
 * Faz uma requisição HTTP tipada com tratamento de erros
 */
export async function fetchJson<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const baseURL = await getBaseURL()
  const url = `${baseURL}${endpoint}`

  const headers = await getHeaders(options?.headers)

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // Envia cookies automaticamente (httpOnly JWT)
  })

  // Parse JSON (mesmo em caso de erro, pode ter JSON com mensagem)
  let data: any
  const contentType = response.headers.get("content-type")
  if (contentType?.includes("application/json")) {
    try {
      data = await response.json()
    } catch {
      // Se não conseguir parsear JSON, usar mensagem padrão
    }
  }

  // Tratar erros HTTP
  if (!response.ok) {
    const errorMessage =
      data?.error || data?.message || `Erro ${response.status}: ${response.statusText}`
    throw new ApiClientError(response.status, errorMessage, data?.code)
  }

  return data as T
}

/**
 * Métodos HTTP helpers
 */
export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    fetchJson<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    fetchJson<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    fetchJson<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    fetchJson<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    fetchJson<T>(endpoint, { ...options, method: "DELETE" }),
}
