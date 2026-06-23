"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload =
      mode === "signup"
        ? {
            name: formData.get("name"),
            email: formData.get("email"),
            password: formData.get("password"),
          }
        : {
            email: formData.get("email"),
            password: formData.get("password"),
          };

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setMessage(result.message ?? "요청을 처리하지 못했습니다.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-md flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      {mode === "signup" ? (
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          이름
          <input name="name" className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500" required />
        </label>
      ) : null}
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        이메일
        <input name="email" type="email" className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500" required />
      </label>
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        비밀번호
        <input name="password" type="password" className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500" required />
      </label>
      {message ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{message}</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-emerald-600 px-4 py-2.5 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {isSubmitting ? "처리 중..." : mode === "signup" ? "회원가입" : "로그인"}
      </button>
    </form>
  );
}
