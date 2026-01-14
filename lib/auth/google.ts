import { OAuth2Client } from "google-auth-library";

export const googleOAuthClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/google/callback`
);

export const ALLOWED_DOMAIN = "@grupoativa.net";

export function isAllowedDomain(email: string): boolean {
  return email.endsWith(ALLOWED_DOMAIN);
}
