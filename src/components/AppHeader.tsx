import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { CartNavLink } from "./CartNavLink";
import { LogoutButton } from "./LogoutButton";

export async function AppHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-lg font-black text-emerald-700">
          배달 데모
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link className="rounded-md px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100" href="/">
            메뉴
          </Link>
          <CartNavLink />
          <Link className="rounded-md px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100" href="/orders">
            주문내역
          </Link>
          <Link className="rounded-md px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100" href="/favorites">
            즐겨찾기
          </Link>
          {user ? (
            <>
              <span className="hidden text-slate-500 sm:inline">{user.name}님</span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link className="rounded-md px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100" href="/login">
                로그인
              </Link>
              <Link className="rounded-md bg-emerald-600 px-3 py-2 font-semibold text-white hover:bg-emerald-700" href="/signup">
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
