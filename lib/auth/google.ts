import { OAuth2Client } from "google-auth-library";

// Construir a URL de redirecionamento corretamente
const getRedirectURI = (): string => {
  // Se GOOGLE_REDIRECT_URI estiver definido, usar ele
  if (process.env.GOOGLE_REDIRECT_URI) {
    return process.env.GOOGLE_REDIRECT_URI
  }
  
  // Caso contrário, construir a partir de APP_URL ou NEXT_PUBLIC_APP_URL
  const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL
  
  if (baseUrl) {
    return `${baseUrl}/api/auth/google/callback`
  }
  
  // Último fallback: localhost apenas em desenvolvimento
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http"
  return `${protocol}://localhost:3000/api/auth/google/callback`
}

export const googleOAuthClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  getRedirectURI()
);

export const ALLOWED_DOMAIN = "@grupoativa.net";

export function isAllowedDomain(email: string): boolean {
  return email.endsWith(ALLOWED_DOMAIN);
}
