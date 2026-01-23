import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifyAuthToken } from "@/lib/auth/jwt";
import {
  isPublicRoute,
  isProtectedRoute,
  requiresAdminRole,
  getDefaultRoute,
} from "@/lib/routes/config";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignorar todas as rotas de API (elas fazem sua própria validação de autenticação)
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Ignorar arquivos estáticos da pasta public (incluindo uploads)
  if (pathname.startsWith("/uploads/")) {
    return NextResponse.next();
  }

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  // ============================================
  // CASO 1: Usuário NÃO autenticado
  // ============================================
  if (!token) {
    // Se tentando acessar rota pública, permite
    if (isPublicRoute(pathname)) {
      return NextResponse.next();
    }

    // Se tentando acessar rota protegida, redireciona para login
    if (isProtectedRoute(pathname)) {
      const loginUrl = new URL("/login", req.url);
      // Salva a URL original para redirecionar após login
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Rota raiz: redireciona para login
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Outras rotas não protegidas: permite
    return NextResponse.next();
  }

  // ============================================
  // CASO 2: Usuário autenticado (com token)
  // ============================================
  try {
    const payload = await verifyAuthToken(token);

    // Se logado e tentando acessar login/register, redireciona para rota padrão
    if (isPublicRoute(pathname)) {
      const defaultRoute = getDefaultRoute(payload.role);
      return NextResponse.redirect(new URL(defaultRoute, req.url));
    }

    // Rota raiz: redireciona para rota padrão baseada no role
    if (pathname === "/") {
      const defaultRoute = getDefaultRoute(payload.role);
      return NextResponse.redirect(new URL(defaultRoute, req.url));
    }

    // Verificação de role: bloqueia acesso de não-admin a rotas admin
    if (requiresAdminRole(pathname) && payload.role !== "ADMIN") {
      const userDefaultRoute = getDefaultRoute(payload.role);
      return NextResponse.redirect(new URL(userDefaultRoute, req.url));
    }

    // Verificação adicional: usuários não-admin não podem acessar /admin/*
    if (pathname.startsWith("/admin") && payload.role !== "ADMIN") {
      const userDefaultRoute = getDefaultRoute(payload.role);
      return NextResponse.redirect(new URL(userDefaultRoute, req.url));
    }

    // Tudo ok, permite acesso
    return NextResponse.next();
  } catch (error) {
    // Token inválido/expirado: limpa cookie e redireciona para login
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.set(AUTH_COOKIE_NAME, "", { path: "/", maxAge: 0 });
    return res;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - uploads/ (uploaded files)
     * - public folder files with common extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|uploads/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|txt|pdf|doc|docx|xls|xlsx|csv)$).*)",
  ],
};
