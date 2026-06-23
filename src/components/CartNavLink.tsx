"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCartItemCount, getCartItems } from "@/lib/cart";

export function CartNavLink() {
  const [count, setCount] = useState(() => {
    if (typeof window === "undefined") {
      return 0;
    }

    return getCartItemCount(getCartItems());
  });

  useEffect(() => {
    function syncCount() {
      setCount(getCartItemCount(getCartItems()));
    }

    window.addEventListener("cart-updated", syncCount);
    window.addEventListener("storage", syncCount);

    return () => {
      window.removeEventListener("cart-updated", syncCount);
      window.removeEventListener("storage", syncCount);
    };
  }, []);

  return (
    <Link className="rounded-md px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100" href="/cart">
      장바구니 {count > 0 ? <span className="font-black text-emerald-700">({count})</span> : null}
    </Link>
  );
}
