import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { signAuthToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE_NAME, authCookieOptions } from "@/lib/auth/cookies";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    // Verificar se usuário tem senha (não é OAuth)
    if (!user.password) {
      return NextResponse.json(
        { error: "Este usuário precisa fazer login com Google" },
        { status: 401 }
      );
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    const tokenVersion = (user as any).tokenVersion ?? 0;

    const token = await signAuthToken({
      sub: user.id,
      role: user.role,
      tokenVersion,
    });

    const res = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    res.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions());

    return res;
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno no login" },
      { status: 500 }
    );
  }
}
