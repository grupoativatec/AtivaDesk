// lib/auth/jwt.ts
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export type JwtPayload = {
  sub: string; // userId
  role: "USER" | "AGENT" | "ADMIN";
  tokenVersion: number;
};

export async function signAuthToken(
  payload: JwtPayload,
  expiresIn = process.env.JWT_EXPIRES_IN || "7d"
) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

export async function verifyAuthToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  // payload aqui vem como JWTPayload; normalizamos
  return payload as unknown as JwtPayload & { exp: number; iat: number };
}
