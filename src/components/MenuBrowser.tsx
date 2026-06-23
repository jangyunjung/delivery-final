"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { getCartItemCount, getCartItems, getRestaurantCartCount, mergeCartItems, saveCartItems } from "@/lib/cart";
import type { CartItem, RestaurantWithMenus } from "@/types/cart";

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

export function MenuBrowser({ restaurants }: { restaurants: RestaurantWithMenus[] }) {
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    return getCartItems();
  });
  const [notice, setNotice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");

  const categories = useMemo(() => ["전체", ...new Set(restaurants.map((restaurant) => restaurant.category))], [restaurants]);
  const totalCartCount = getCartItemCount(cartItems);
  const visibleRestaurants =
    selectedCategory === "전체"
      ? restaurants
      : restaurants.filter((restaurant) => restaurant.category === selectedCategory);

  useEffect(() => {
    function syncCart() {
      setCartItems(getCartItems());
    }

    window.addEventListener("cart-updated", syncCart);
    window.addEventListener("storage", syncCart);

    return () => {
      window.removeEventListener("cart-updated", syncCart);
      window.removeEventListener("storage", syncCart);
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  function addToCart(restaurant: RestaurantWithMenus, menuItem: RestaurantWithMenus["menuItems"][number]) {
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
    setCartItems(nextCartItems);
    setNotice(`${menuItem.name}을 장바구니에 담았습니다.`);

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = setTimeout(() => {
      setNotice("");
    }, 1800);
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-700">로컬 SQLite 데모</p>
            <h1 className="mt-1 text-3xl font-black text-slate-950">식당과 메뉴를 골라 주문해보세요</h1>
          </div>
          <Link href="/cart" className="rounded-md bg-emerald-600 px-4 py-2 text-center font-semibold text-white hover:bg-emerald-700">
            장바구니 보기{totalCartCount > 0 ? ` (${totalCartCount})` : ""}
          </Link>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`rounded-md border px-3 py-2 text-sm font-semibold ${
              selectedCategory === category
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {notice ? (
        <div className="fixed bottom-5 left-1/2 z-20 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-lg bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg">
          {notice}
        </div>
      ) : null}

      <div className="grid gap-5">
        {visibleRestaurants.map((restaurant) => (
          <section key={restaurant.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="grid gap-0 md:grid-cols-[240px_1fr]">
              <div className="min-h-44 bg-slate-100">
                {restaurant.imageUrl ? (
                  <img src={restaurant.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-emerald-700">{restaurant.category}</p>
                    <h2 className="text-2xl font-black text-slate-950">{restaurant.name}</h2>
                    <p className="mt-1 text-sm text-slate-600">{restaurant.description}</p>
                  </div>
                  {getRestaurantCartCount(cartItems, restaurant.id) > 0 ? (
                    <span className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-700">
                      이 가게에서 {getRestaurantCartCount(cartItems, restaurant.id)}개 담김
                    </span>
                  ) : (
                    <span className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-500">
                      아직 담긴 메뉴 없음
                    </span>
                  )}
                </div>
                <div className="mt-5 grid gap-3">
                  {restaurant.menuItems.map((menuItem) => (
                    <div key={menuItem.id} className="flex flex-col gap-3 rounded-md border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-bold text-slate-950">{menuItem.name}</h3>
                        <p className="text-sm text-slate-600">{menuItem.description}</p>
                        <p className="mt-1 font-black text-slate-900">{formatPrice(menuItem.price)}</p>
                      </div>
                      <button
                        onClick={() => addToCart(restaurant, menuItem)}
                        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                      >
                        담기
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
