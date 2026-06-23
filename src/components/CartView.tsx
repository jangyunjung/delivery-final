"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { clearCartItems, getCartItemCount, getCartItems, saveCartItems } from "@/lib/cart";
import type { CartItem } from "@/types/cart";

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

export function CartView({ isLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    return getCartItems();
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
  const totalCount = getCartItemCount(items);

  function updateQuantity(menuItemId: number, nextQuantity: number) {
    const nextItems =
      nextQuantity <= 0
        ? items.filter((item) => item.menuItemId !== menuItemId)
        : items.map((item) => (item.menuItemId === menuItemId ? { ...item, quantity: nextQuantity } : item));
    setItems(nextItems);
    saveCartItems(nextItems);
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

    clearCartItems();
    setItems([]);
    router.push("/orders");
    router.refresh();
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-black text-slate-950">장바구니</h1>
        <p className="mt-1 text-slate-600">여러 식당의 메뉴를 한 번에 주문하고, 식당별 요청사항을 남길 수 있습니다.</p>
        {!isLoggedIn ? (
          <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            로그인하지 않은 상태입니다. 메뉴 확인은 가능하지만 주문하려면 로그인이 필요합니다.
          </p>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <p className="text-lg font-black text-slate-950">장바구니가 비어 있습니다.</p>
          <p className="mt-2 text-slate-600">메뉴 화면에서 원하는 메뉴를 담으면 여기에 표시됩니다.</p>
          <Link href="/" className="mt-4 inline-flex rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700">
            메뉴 담으러 가기
          </Link>
        </div>
      ) : (
        <div className="grid gap-5">
          {groups.map(([restaurantId, group]) => (
            <section key={restaurantId} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-950">{group.restaurantName}</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {getCartItemCount(group.items)}개 메뉴 담김
                  </p>
                </div>
                <div className="rounded-md bg-emerald-50 px-4 py-2 text-right">
                  <p className="text-xs font-bold text-emerald-700">가게별 소계</p>
                  <p className="text-xl font-black text-emerald-800">{formatPrice(group.subtotal)}</p>
                </div>
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
              <label className="mt-4 grid gap-2 rounded-md border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-slate-800">
                <span>식당 요청사항</span>
                <input
                  value={requests[String(restaurantId)] ?? ""}
                  onChange={(event) => setRequests({ ...requests, [String(restaurantId)]: event.target.value })}
                  className="rounded-md border border-emerald-200 bg-white px-3 py-2 outline-none focus:border-emerald-500"
                  placeholder="예: 단무지 많이 주세요"
                />
              </label>
            </section>
          ))}

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-lg font-black text-slate-950">총 주문금액 ({totalCount}개)</span>
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
