import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/session";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ message: "이메일과 비밀번호를 입력해주세요." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: String(email).toLowerCase() },
  });

  if (!user) {
    return NextResponse.json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const passwordMatches = await bcrypt.compare(String(password), user.passwordHash);

  if (!passwordMatches) {
    return NextResponse.json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  await setSession(user.id);

  return NextResponse.json({ ok: true });
}
