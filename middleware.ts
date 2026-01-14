import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifyAuthToken } from "@/lib/auth/jwt";

const PUBLIC_ROUTES = ["/login", "/register"];
const USER_HOME = "/tickets/new";
const ADMIN_HOME = "/admin/dashboard";

function isPublic(pathname: string) {
  return PUBLIC_ROUTES.some((p) => pathname.startsWith(p));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  // Sem token: bloqueia áreas protegidas
  if (!token) {
    if (pathname.startsWith("/admin") || pathname.startsWith("/tickets")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  // Com token: valida
  try {
    const payload = await verifyAuthToken(token);

    // Se logado e tentando acessar login/register, redireciona conforme role
    if (isPublic(pathname)) {
      return NextResponse.redirect(
        new URL(payload.role === "ADMIN" ? ADMIN_HOME : USER_HOME, req.url)
      );
    }

    // Bloqueio role-based
    if (pathname.startsWith("/admin") && payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL(USER_HOME, req.url));
    }

    return NextResponse.next();
  } catch {
    // Token inválido/expirado: manda pro login
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.set(AUTH_COOKIE_NAME, "", { path: "/", maxAge: 0 });
    return res;
  }
}

export const config = {
  matcher: ["/login", "/register", "/admin/:path*", "/tickets/:path*"],
};
