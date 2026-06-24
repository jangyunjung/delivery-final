"use client";

import Link from "next/link";
import { getCartItemCount } from "@/lib/cart";
import { useCartItems } from "@/hooks/useCartItems";

export function CartNavLink() {
  const count = getCartItemCount(useCartItems());

  return (
    <Link className="rounded-md px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100" href="/cart">
      장바구니 {count > 0 ? <span className="font-black text-emerald-700">({count})</span> : null}
    </Link>
  );
}
