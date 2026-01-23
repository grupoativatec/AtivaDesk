export const AUTH_COOKIE_NAME = "JWT_SECRET";

export function authCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  
  // 7 dias em segundos (mesmo tempo de expiração do JWT)
  const maxAge = 7 * 24 * 60 * 60; // 604800 segundos

  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge, // Cookie dura 7 dias, mesmo que o JWT
  };
}
