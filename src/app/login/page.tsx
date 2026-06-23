import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="grid gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-black text-slate-950">로그인</h1>
        <p className="mt-2 text-slate-600">테스트 계정: demo@example.com / password123</p>
      </div>
      <AuthForm mode="login" />
      <p className="text-center text-sm text-slate-600">
        계정이 없나요?{" "}
        <Link className="font-bold text-emerald-700" href="/signup">
          회원가입
        </Link>
      </p>
    </div>
  );
}
