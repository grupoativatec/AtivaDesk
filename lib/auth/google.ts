import { OAuth2Client } from "google-auth-library";

/**
 * URL base da aplicação
 */
const APP_BASE_URL = "https://ativadesk.grupoativa.net:19831"

/**
 * URL de redirecionamento do Google OAuth
 */
const GOOGLE_REDIRECT_URI = `${APP_BASE_URL}/api/auth/google/callback`

export const googleOAuthClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

export const ALLOWED_DOMAIN = "@grupoativa.net";

export function isAllowedDomain(email: string): boolean {
  return email.endsWith(ALLOWED_DOMAIN);
}
