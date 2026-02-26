/**
 * Configuração centralizada de rotas e proteção
 */

export const ROUTES = {
  // Rotas públicas (não requerem autenticação)
  PUBLIC: {
    LOGIN: "/login",
    REGISTER: "/register",
  },

  // Rotas padrão após login (por role)
  DEFAULT: {
    ADMIN: "/admin/dashboard",
    USER: "/tickets",
    AGENT: "/tickets",
  },

  // Rotas protegidas por role
  PROTECTED: {
    ADMIN: {
      prefix: "/admin",
      routes: [
        "/admin",
        "/admin/dashboard",
        "/admin/tickets",
        "/admin/tarefas",
        "/admin/projetos",
        "/admin/kanban",
        "/admin/docs",
        "/admin/certificados",
      ],
    },
    USER: {
      prefix: "/tickets",
      routes: [
        "/tickets",
        "/tickets/new",
        "/tickets/[id]",
      ],
    },
  },

  // Rotas da API que requerem autenticação
  API: {
    // APIs públicas (não requerem autenticação)
    PUBLIC: [
      "/api/auth/login",
      "/api/auth/register",
      "/api/auth/google",
      "/api/auth/google/callback",
    ],
    // APIs que requerem autenticação (qualquer usuário)
    AUTH_REQUIRED: [
      "/api/auth/logout",
      "/api/auth/me",
      "/api/tickets",
      "/api/kanban",
      "/api/upload",
    ],
    // APIs que requerem role ADMIN
    ADMIN_ONLY: [
      "/api/admin",
    ],
  },
} as const;

/**
 * Verifica se uma rota é pública
 */
export function isPublicRoute(pathname: string): boolean {
  return Object.values(ROUTES.PUBLIC).some((route) => pathname === route);
}

/**
 * Verifica se uma rota requer autenticação
 * Nota: Esta função é usada apenas para rotas de páginas (não API)
 */
export function isProtectedRoute(pathname: string): boolean {
  // Rotas públicas não são protegidas
  if (isPublicRoute(pathname)) {
    return false;
  }

  // Rotas de admin são protegidas
  if (pathname.startsWith(ROUTES.PROTECTED.ADMIN.prefix)) {
    return true;
  }

  // Rotas de tickets são protegidas
  if (pathname.startsWith(ROUTES.PROTECTED.USER.prefix)) {
    return true;
  }

  // Rota raiz requer autenticação (será redirecionada)
  if (pathname === "/") {
    return true;
  }

  return false;
}

/**
 * Verifica se uma rota requer role ADMIN
 */
export function requiresAdminRole(pathname: string): boolean {
  // Rotas de admin requerem ADMIN
  if (pathname.startsWith(ROUTES.PROTECTED.ADMIN.prefix)) {
    return true;
  }

  // APIs de admin requerem ADMIN
  if (pathname.startsWith("/api/admin")) {
    return true;
  }

  return false;
}

/**
 * Obtém a rota padrão baseada no role do usuário
 */
export function getDefaultRoute(role: "USER" | "AGENT" | "ADMIN"): string {
  if (role === "ADMIN") {
    return ROUTES.DEFAULT.ADMIN;
  }
  return ROUTES.DEFAULT.USER;
}
