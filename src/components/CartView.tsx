"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { CartItem } from "@/types/cart";

const CART_KEY = "delivery-demo-cart";

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? "[]") as CartItem[];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function CartView({ isLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    return loadCart();
  });
  const [requests, setRequests] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [isOrdering, setIsOrdering] = useState(false);

  const groups = useMemo(() => {
    const grouped = new Map<number, { restaurantName: string; items: CartItem[]; subtotal: number }>();

    for (const item of items) {
      const group = grouped.get(item.restaurantId) ?? {
        restaurantName: item.restaurantName,
        items: [],
        subtotal: 0,
      };
      group.items.push(item);
      group.subtotal += item.price * item.quantity;
      grouped.set(item.restaurantId, group);
    }

    return [...grouped.entries()];
  }, [items]);

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function updateQuantity(menuItemId: number, nextQuantity: number) {
    const nextItems =
      nextQuantity <= 0
        ? items.filter((item) => item.menuItemId !== menuItemId)
        : items.map((item) => (item.menuItemId === menuItemId ? { ...item, quantity: nextQuantity } : item));
    setItems(nextItems);
    saveCart(nextItems);
  }

  async function placeOrder() {
    setMessage("");

    if (!isLoggedIn) {
      setMessage("로그인 후 주문할 수 있습니다.");
      router.push("/login");
      return;
    }

    if (items.length === 0) {
      setMessage("장바구니가 비어 있습니다.");
      return;
    }

    setIsOrdering(true);
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        })),
        restaurantRequests: requests,
      }),
    });
    const result = await response.json();
    setIsOrdering(false);

    if (!response.ok) {
      setMessage(result.message ?? "주문을 저장하지 못했습니다.");
      return;
    }

    localStorage.removeItem(CART_KEY);
    setItems([]);
    router.push("/orders");
    router.refresh();
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-black text-slate-950">장바구니</h1>
        <p className="mt-1 text-slate-600">여러 식당의 메뉴를 한 번에 주문하고, 식당별 요청사항을 남길 수 있습니다.</p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-600">아직 담긴 메뉴가 없습니다.</p>
          <Link href="/" className="mt-4 inline-flex rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700">
            메뉴 담으러 가기
          </Link>
        </div>
      ) : (
        <div className="grid gap-5">
          {groups.map(([restaurantId, group]) => (
            <section key={restaurantId} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <h2 className="text-xl font-black text-slate-950">{group.restaurantName}</h2>
                <p className="font-bold text-slate-900">{formatPrice(group.subtotal)}</p>
              </div>
              <div className="mt-4 grid gap-3">
                {group.items.map((item) => (
                  <div key={item.menuItemId} className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-slate-50 p-3">
                    <div>
                      <p className="font-bold text-slate-950">{item.name}</p>
                      <p className="text-sm text-slate-600">{formatPrice(item.price)} x {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} className="h-9 w-9 rounded-md border border-slate-300 font-bold">
                        -
                      </button>
                      <span className="w-8 text-center font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} className="h-9 w-9 rounded-md border border-slate-300 font-bold">
                        +
                      </button>
                      <button onClick={() => updateQuantity(item.menuItemId, 0)} className="rounded-md px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50">
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <label className="mt-4 grid gap-2 text-sm font-semibold text-slate-700">
                식당 요청사항
                <input
                  value={requests[String(restaurantId)] ?? ""}
                  onChange={(event) => setRequests({ ...requests, [String(restaurantId)]: event.target.value })}
                  className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
                  placeholder="예: 단무지 많이 주세요"
                />
              </label>
            </section>
          ))}

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-lg font-black text-slate-950">총 주문금액</span>
              <span className="text-2xl font-black text-emerald-700">{formatPrice(totalPrice)}</span>
            </div>
            {message ? <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{message}</p> : null}
            <button
              onClick={placeOrder}
              disabled={isOrdering}
              className="mt-4 w-full rounded-md bg-emerald-600 px-4 py-3 font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {isOrdering ? "주문 저장 중..." : "주문하기"}
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
