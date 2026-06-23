import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <div className="grid gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-black text-slate-950">회원가입</h1>
        <p className="mt-2 text-slate-600">이메일 중복을 확인하고 비밀번호는 hash로 저장합니다.</p>
      </div>
      <AuthForm mode="signup" />
      <p className="text-center text-sm text-slate-600">
        이미 계정이 있나요?{" "}
        <Link className="font-bold text-emerald-700" href="/login">
          로그인
        </Link>
      </p>
    </div>
  );
}
