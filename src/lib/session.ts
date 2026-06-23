import { cookies } from "next/headers";
import { prisma } from "./prisma";

const SESSION_COOKIE = "delivery_user_id";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = Number(cookieStore.get(SESSION_COOKIE)?.value);

  if (!Number.isInteger(userId) || userId <= 0) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });
}

export async function setSession(userId: number) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, String(userId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
