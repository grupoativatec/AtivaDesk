import { NextResponse } from "next/server";
import { googleOAuthClient } from "@/lib/auth/google";

export async function GET() {
  try {
    const authUrl = googleOAuthClient.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
      ],
      prompt: "consent",
    });

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error("Erro ao gerar URL de autenticação Google:", error);
    return NextResponse.json(
      { error: "Erro ao iniciar autenticação Google" },
      { status: 500 }
    );
  }
}
