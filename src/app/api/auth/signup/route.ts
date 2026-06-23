import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/session";

export async function POST(request: Request) {
  const { email, password, name } = await request.json();

  if (!email || !password || !name) {
    return NextResponse.json({ message: "이름, 이메일, 비밀번호를 입력해주세요." }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ message: "비밀번호는 6자 이상이어야 합니다." }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: String(email).toLowerCase() },
  });

  if (existingUser) {
    return NextResponse.json({ message: "이미 가입된 이메일입니다." }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      email: String(email).toLowerCase(),
      name: String(name),
      passwordHash: await bcrypt.hash(String(password), 10),
    },
  });

  await setSession(user.id);

  return NextResponse.json({ ok: true });
}
