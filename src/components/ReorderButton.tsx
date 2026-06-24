"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getCartItemCount, getCartItems, mergeCartItems, saveCartItems } from "@/lib/cart";
import type { CartItem } from "@/types/cart";

type ReorderItem = {
  menuItemId: number | null;
  name: string;
  price: number;
  quantity: number;
  restaurantId: number;
  restaurantName: string;
};

export function ReorderButton({ items }: { items: ReorderItem[] }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  function reorder() {
    const availableItems: CartItem[] = items
      .filter((item): item is ReorderItem & { menuItemId: number } => Boolean(item.menuItemId))
      .map((item) => ({
        menuItemId: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        restaurantId: item.restaurantId,
        restaurantName: item.restaurantName,
      }));

    if (availableItems.length === 0) {
      setMessage("다시 담을 수 있는 현재 메뉴가 없습니다.");
      return;
    }

    const nextCartItems = mergeCartItems(getCartItems(), availableItems);
    saveCartItems(nextCartItems);

    const skippedCount = items.length - availableItems.length;
    const addedCount = getCartItemCount(availableItems);
    setMessage(
      skippedCount > 0
        ? `${addedCount}개를 다시 담았습니다. 삭제된 메뉴 ${skippedCount}개는 제외했습니다.`
        : `${addedCount}개를 장바구니에 다시 담았습니다.`
    );

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setMessage("");
    }, 2200);
  }

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <button onClick={reorder} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700">
        다시 담기
      </button>
      {message ? (
        <div className="max-w-xs text-sm font-semibold text-emerald-700">
          <p>{message}</p>
          <Link href="/cart" className="mt-1 inline-flex text-slate-700 underline">
            장바구니 보기
          </Link>
        </div>
      ) : null}
    </div>
  );
}
