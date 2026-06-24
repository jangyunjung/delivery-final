"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setIsLoggedOut(true);
    window.dispatchEvent(new CustomEvent("auth-changed", { detail: { isLoggedIn: false } }));
    window.dispatchEvent(new Event("cart-updated"));

    startTransition(() => {
      router.replace("/");
      router.refresh();
    });
  }

  return (
    <button
      onClick={logout}
      disabled={isPending || isLoggedOut}
      className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
    >
      {isLoggedOut ? "로그아웃됨" : "로그아웃"}
    </button>
  );
}
