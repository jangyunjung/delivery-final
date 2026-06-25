"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { getCartItemCount, getCartItems, mergeCartItems, saveCartItems } from "@/lib/cart";
import type { CartItem } from "@/types/cart";

export type ReorderGroup = {
  id: number;
  restaurantName: string;
  items: {
    id: number;
    menuItemId: number | null;
    name: string;
    price: number;
    quantity: number;
    restaurantId: number;
    restaurantName: string;
    isAvailable: boolean;
  }[];
};

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

export function ReorderPanel({ groups }: { groups: ReorderGroup[] }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const availableItemIds = useMemo(
    () => groups.flatMap((group) => group.items.filter((item) => item.isAvailable && item.menuItemId).map((item) => item.id)),
    [groups]
  );
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>(availableItemIds);
  const [message, setMessage] = useState("");

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const selectedItems = groups
    .flatMap((group) => group.items)
    .filter((item) => selectedItemIds.includes(item.id));

  function showMessage(nextMessage: string) {
    setMessage(nextMessage);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setMessage("");
    }, 2600);
  }

  function toCartItems(items: ReorderGroup["items"]): CartItem[] {
    return items
      .filter((item): item is ReorderGroup["items"][number] & { menuItemId: number } => item.isAvailable && Boolean(item.menuItemId))
      .map((item) => ({
        menuItemId: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        restaurantId: item.restaurantId,
        restaurantName: item.restaurantName,
      }));
  }

  function addItemsToCart(items: ReorderGroup["items"], emptyMessage: string) {
    const cartItems = toCartItems(items);

    if (cartItems.length === 0) {
      showMessage(emptyMessage);
      return;
    }

    const nextCartItems = mergeCartItems(getCartItems(), cartItems);
    saveCartItems(nextCartItems);

    const skippedCount = items.length - cartItems.length;
    const addedCount = getCartItemCount(cartItems);
    showMessage(
      skippedCount > 0
        ? `${addedCount}개를 다시 담았습니다. 현재 메뉴가 없는 항목 ${skippedCount}개는 제외했습니다.`
        : `${addedCount}개를 장바구니에 다시 담았습니다.`
    );
  }

  function toggleItem(itemId: number) {
    setSelectedItemIds((currentIds) =>
      currentIds.includes(itemId)
        ? currentIds.filter((currentId) => currentId !== itemId)
        : [...currentIds, itemId]
    );
  }

  function toggleGroup(group: ReorderGroup) {
    const groupItemIds = group.items.filter((item) => item.isAvailable && item.menuItemId).map((item) => item.id);
    const isEveryGroupItemSelected = groupItemIds.every((itemId) => selectedItemIds.includes(itemId));

    setSelectedItemIds((currentIds) =>
      isEveryGroupItemSelected
        ? currentIds.filter((itemId) => !groupItemIds.includes(itemId))
        : [...new Set([...currentIds, ...groupItemIds])]
    );
  }

  return (
    <section className="mt-5 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-black text-slate-950">다시 담기</h3>
          <p className="mt-1 text-sm text-slate-600">주문 전체, 가게별, 메뉴별로 골라 장바구니에 다시 담을 수 있습니다.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => addItemsToCart(groups.flatMap((group) => group.items), "다시 담을 수 있는 현재 메뉴가 없습니다.")}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700"
          >
            주문 전체 다시 담기
          </button>
          <button
            onClick={() => addItemsToCart(selectedItems, "선택한 메뉴 중 다시 담을 수 있는 현재 메뉴가 없습니다.")}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
          >
            선택한 메뉴 다시 담기
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {groups.map((group) => {
          const availableGroupItemIds = group.items.filter((item) => item.isAvailable && item.menuItemId).map((item) => item.id);
          const selectedGroupCount = availableGroupItemIds.filter((itemId) => selectedItemIds.includes(itemId)).length;

          return (
            <div key={group.id} className="rounded-md bg-white p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2 font-black text-slate-900">
                  <input
                    type="checkbox"
                    checked={availableGroupItemIds.length > 0 && selectedGroupCount === availableGroupItemIds.length}
                    onChange={() => toggleGroup(group)}
                    disabled={availableGroupItemIds.length === 0}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  {group.restaurantName}
                </label>
                <button
                  onClick={() => addItemsToCart(group.items, "이 가게에는 다시 담을 수 있는 현재 메뉴가 없습니다.")}
                  className="rounded-md border border-emerald-300 px-3 py-1.5 text-sm font-bold text-emerald-700 hover:bg-emerald-50"
                >
                  이 가게만 다시 담기
                </button>
              </div>
              <div className="mt-3 grid gap-2">
                {group.items.map((item) => (
                  <label key={item.id} className={`flex flex-wrap items-center justify-between gap-2 rounded-md px-3 py-2 text-sm ${item.isAvailable ? "bg-slate-50" : "bg-slate-100 text-slate-500"}`}>
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedItemIds.includes(item.id)}
                        onChange={() => toggleItem(item.id)}
                        disabled={!item.isAvailable || !item.menuItemId}
                        className="h-4 w-4 accent-emerald-600"
                      />
                      <span className="font-semibold">
                        {item.name} x {item.quantity}
                      </span>
                      {!item.isAvailable ? <span className="text-xs font-bold text-rose-600">현재 메뉴 없음</span> : null}
                    </span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {message ? (
        <div className="mt-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-emerald-700">
          <p>{message}</p>
          <Link href="/cart" className="mt-1 inline-flex text-slate-700 underline">
            장바구니 보기
          </Link>
        </div>
      ) : null}
    </section>
  );
}
