import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "./cookies";
import { verifyAuthToken } from "./jwt";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    const payload = await verifyAuthToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}
