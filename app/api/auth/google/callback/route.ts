import { NextResponse } from "next/server";
import { googleOAuthClient, isAllowedDomain } from "@/lib/auth/google";
import { prisma } from "@/lib/prisma";
import { signAuthToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE_NAME, authCookieOptions } from "@/lib/auth/cookies";

/**
 * URL base da aplicação
 */
const APP_BASE_URL = "https://ativadesk.grupoativa.net:19831"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.redirect(
        new URL("/login?error=missing_code", APP_BASE_URL)
      );
    }

    // Trocar código por tokens
    const { tokens } = await googleOAuthClient.getToken(code);
    googleOAuthClient.setCredentials(tokens);

    // Obter informações do usuário usando a API do Google
    const userInfoResponse = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokens.access_token}`
    );

    if (!userInfoResponse.ok) {
      return NextResponse.redirect(
        new URL("/login?error=invalid_token", APP_BASE_URL)
      );
    }

    const userInfo = await userInfoResponse.json();
    const { email, name, id: googleId } = userInfo;

    if (!email || !name || !googleId) {
      return NextResponse.redirect(
        new URL("/login?error=invalid_token", APP_BASE_URL)
      );
    }

    // Validar domínio permitido
    if (!isAllowedDomain(email)) {
      return NextResponse.redirect(
        new URL(
          "/login?error=domain_not_allowed",
          APP_BASE_URL
        )
      );
    }

    // Verificar se usuário já existe
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { googleId }],
      },
    });

    if (user) {
      // Atualizar googleId se necessário
      if (!user.googleId && googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId },
        });
      }
    } else {
      // Criar novo usuário
      user = await prisma.user.create({
        data: {
          email,
          name,
          googleId,
          role: "USER",
          password: null, // Usuário OAuth não tem senha
        },
      });
    }

    // Gerar token JWT
    const token = await signAuthToken({
      sub: user.id,
      role: user.role,
      tokenVersion: user.tokenVersion ?? 0,
    });

    // Redirecionar com cookie
    const redirectUrl = new URL(
      user.role === "ADMIN" ? "/admin/dashboard" : "/tickets",
      APP_BASE_URL
    );

    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions());

    return response;
  } catch (error) {
    console.error("Erro no callback do Google:", error);
    return NextResponse.redirect(
      new URL("/login?error=oauth_error", APP_BASE_URL)
    );
  }
}
