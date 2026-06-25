"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { getCartItems, mergeCartItems, saveCartItems } from "@/lib/cart";

type RestaurantDetailProps = {
  initialIsFavorite: boolean;
  isLoggedIn: boolean;
  restaurant: {
    id: number;
    name: string;
    category: string;
    description: string;
    imageUrl: string | null;
    menuItems: {
      id: number;
      name: string;
      description: string;
      price: number;
    }[];
  };
};

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

export function RestaurantDetail({ initialIsFavorite, isLoggedIn, restaurant }: RestaurantDetailProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [notice, setNotice] = useState("");

  function showNotice(message: string) {
    setNotice(message);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setNotice("");
    }, 1800);
  }

  function addToCart(menuItem: RestaurantDetailProps["restaurant"]["menuItems"][number]) {
    if (!isLoggedIn) {
      window.alert("로그인이 필요한 서비스입니다.");
      return;
    }

    const nextCartItems = mergeCartItems(getCartItems(), [
      {
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
      },
    ]);

    saveCartItems(nextCartItems);
    showNotice(`${menuItem.name}을 장바구니에 담았습니다.`);
  }

  async function toggleFavorite() {
    if (!isLoggedIn) {
      showNotice("로그인 후 식당을 즐겨찾기할 수 있습니다.");
      return;
    }

    const previousValue = isFavorite;
    const nextValue = !isFavorite;
    setIsFavorite(nextValue);
    showNotice(nextValue ? `${restaurant.name}을 즐겨찾기에 추가했습니다.` : `${restaurant.name} 즐겨찾기를 해제했습니다.`);

    const response = await fetch("/api/favorites", {
      method: nextValue ? "POST" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurantId: restaurant.id }),
    });

    if (!response.ok) {
      setIsFavorite(previousValue);
      const result = await response.json();
      showNotice(result.message ?? "즐겨찾기를 저장하지 못했습니다.");
    }
  }

  return (
    <div className="grid gap-6">
      <Link href="/" className="text-sm font-bold text-emerald-700 hover:underline">
        메뉴 목록으로 돌아가기
      </Link>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[420px_1fr]">
          <div className="min-h-72 bg-slate-100">
            {restaurant.imageUrl ? <img src={restaurant.imageUrl} alt="" className="h-full w-full object-cover" /> : null}
          </div>
          <div className="p-6">
            <p className="text-sm font-bold text-emerald-700">{restaurant.category}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-black text-slate-950">{restaurant.name}</h1>
              {isFavorite ? <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-black text-amber-700">즐겨찾기</span> : null}
            </div>
            <p className="mt-3 text-slate-600">{restaurant.description}</p>
            <p className="mt-4 text-sm font-semibold text-slate-700">
              메뉴: {restaurant.menuItems.map((menuItem) => menuItem.name).join(", ")}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={toggleFavorite}
                className={`rounded-md border px-4 py-2 text-sm font-black ${
                  isFavorite
                    ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {isFavorite ? "즐겨찾기 해제" : "즐겨찾기"}
              </button>
              <Link href="/cart" className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700">
                장바구니 보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {notice ? (
        <div className="fixed bottom-5 left-1/2 z-20 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-lg bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg">
          {notice}
        </div>
      ) : null}

      <section className="grid gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-950">메뉴</h2>
          <p className="mt-1 text-sm text-slate-600">이 식당에서 주문할 수 있는 메뉴입니다.</p>
        </div>
        {restaurant.menuItems.map((menuItem) => (
          <article key={menuItem.id} className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-950">{menuItem.name}</h3>
              <p className="mt-1 text-sm text-slate-600">{menuItem.description}</p>
              <p className="mt-2 font-black text-slate-800">{formatPrice(menuItem.price)}</p>
            </div>
            <button onClick={() => addToCart(menuItem)} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
              담기
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
