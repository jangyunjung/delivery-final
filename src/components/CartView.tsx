"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { getCartItemCount, saveCartItems } from "@/lib/cart";
import { useCartItems } from "@/hooks/useCartItems";
import type { CartItem } from "@/types/cart";

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

export function CartView({ isLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter();
  const items = useCartItems();
  const [excludedRestaurantIds, setExcludedRestaurantIds] = useState<number[]>([]);
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

  const selectedRestaurantIds = groups
    .map(([restaurantId]) => restaurantId)
    .filter((restaurantId) => !excludedRestaurantIds.includes(restaurantId));
  const selectedItems = items.filter((item) => selectedRestaurantIds.includes(item.restaurantId));
  const selectedTotalPrice = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedTotalCount = getCartItemCount(selectedItems);

  function toggleRestaurantSelection(restaurantId: number) {
    setExcludedRestaurantIds((currentIds) =>
      currentIds.includes(restaurantId)
        ? currentIds.filter((currentId) => currentId !== restaurantId)
        : [...currentIds, restaurantId]
    );
  }

  function updateQuantity(menuItemId: number, nextQuantity: number) {
    const nextItems =
      nextQuantity <= 0
        ? items.filter((item) => item.menuItemId !== menuItemId)
        : items.map((item) => (item.menuItemId === menuItemId ? { ...item, quantity: nextQuantity } : item));
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

    if (selectedItems.length === 0) {
      setMessage("주문할 가게를 선택해주세요.");
      return;
    }

    setIsOrdering(true);
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: selectedItems.map((item) => ({
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

    const remainingItems = items.filter((item) => !selectedRestaurantIds.includes(item.restaurantId));
    saveCartItems(remainingItems);
    setExcludedRestaurantIds([]);
    setRequests({});
    router.push("/orders");
    router.refresh();
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-black text-slate-950">장바구니</h1>
        <p className="mt-1 text-slate-600">여러 식당의 메뉴를 담아두고, 이번에 주문할 가게만 선택할 수 있습니다.</p>
        {!isLoggedIn ? (
          <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            로그인하지 않은 상태입니다. 가격 합산은 가능하지만 주문하려면 로그인이 필요합니다.
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
          {groups.map(([restaurantId, group]) => {
            const isSelected = selectedRestaurantIds.includes(restaurantId);

            return (
              <section key={restaurantId} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRestaurantSelection(restaurantId)}
                      className="mt-1 h-5 w-5 accent-emerald-600"
                    />
                    <span>
                      <span className="block text-xl font-black text-slate-950">{group.restaurantName}</span>
                      <span className="mt-1 block text-sm font-semibold text-slate-500">
                        {getCartItemCount(group.items)}개 메뉴 담김
                      </span>
                      {!isSelected ? (
                        <span className="mt-2 inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">
                          이번 주문에서 제외됨
                        </span>
                      ) : null}
                    </span>
                  </label>
                  <div className={isSelected ? "rounded-md bg-emerald-50 px-4 py-2 text-right" : "rounded-md bg-slate-100 px-4 py-2 text-right"}>
                    <p className={isSelected ? "text-xs font-bold text-emerald-700" : "text-xs font-bold text-slate-500"}>가게별 소계</p>
                    <p className={isSelected ? "text-xl font-black text-emerald-800" : "text-xl font-black text-slate-500"}>
                      {formatPrice(group.subtotal)}
                    </p>
                  </div>
                </div>

                <div className={`mt-4 grid gap-3 ${isSelected ? "" : "opacity-60"}`}>
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
                    disabled={!isSelected}
                    className="rounded-md border border-emerald-200 bg-white px-3 py-2 outline-none focus:border-emerald-500 disabled:bg-slate-100"
                    placeholder={isSelected ? "예: 단무지 많이 주세요" : "이번 주문에서 제외된 가게입니다"}
                  />
                </label>
              </section>
            );
          })}

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-lg font-black text-slate-950">주문 예정 금액 ({selectedTotalCount}개)</span>
                <p className="mt-1 text-sm text-slate-500">체크된 가게의 메뉴만 이번 주문에 포함됩니다.</p>
              </div>
              <span className="text-2xl font-black text-emerald-700">{formatPrice(selectedTotalPrice)}</span>
            </div>
            {message ? <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{message}</p> : null}
            <button
              onClick={placeOrder}
              disabled={isOrdering}
              className="mt-4 w-full rounded-md bg-emerald-600 px-4 py-3 font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {isOrdering ? "주문 저장 중..." : "선택한 가게 주문하기"}
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
