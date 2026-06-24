"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { getCartItemCount, getCartItems, getRestaurantCartCount, mergeCartItems, saveCartItems } from "@/lib/cart";
import { useCartItems } from "@/hooks/useCartItems";
import type { RestaurantWithMenus } from "@/types/cart";

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

type MenuBrowserProps = {
  favoriteRestaurantIds: number[];
  isLoggedIn: boolean;
  restaurants: RestaurantWithMenus[];
};

export function MenuBrowser({ favoriteRestaurantIds, isLoggedIn, restaurants }: MenuBrowserProps) {
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cartItems = useCartItems();
  const [favoriteOverrideIds, setFavoriteOverrideIds] = useState<number[] | null>(null);
  const [notice, setNotice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");

  const categories = useMemo(() => ["전체", "즐겨찾기", ...new Set(restaurants.map((restaurant) => restaurant.category))], [restaurants]);
  const favorites = useMemo(
    () => new Set(favoriteOverrideIds ?? (isLoggedIn ? favoriteRestaurantIds : [])),
    [favoriteOverrideIds, favoriteRestaurantIds, isLoggedIn]
  );
  const totalCartCount = getCartItemCount(cartItems);
  const visibleRestaurants =
    selectedCategory === "전체"
      ? restaurants
      : selectedCategory === "즐겨찾기"
        ? restaurants.filter((restaurant) => favorites.has(restaurant.id))
      : restaurants.filter((restaurant) => restaurant.category === selectedCategory);

  useEffect(() => {
    function syncAuthState(event: Event) {
      const authEvent = event as CustomEvent<{ isLoggedIn: boolean }>;

      if (!authEvent.detail?.isLoggedIn) {
        setFavoriteOverrideIds([]);
      }
    }

    window.addEventListener("auth-changed", syncAuthState);

    return () => {
      window.removeEventListener("auth-changed", syncAuthState);
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
    setNotice(`${menuItem.name}을 장바구니에 담았습니다.`);

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = setTimeout(() => {
      setNotice("");
    }, 1800);
  }

  function showNotice(message: string) {
    setNotice(message);

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = setTimeout(() => {
      setNotice("");
    }, 1800);
  }

  async function toggleFavorite(restaurant: RestaurantWithMenus) {
    if (!isLoggedIn) {
      showNotice("로그인 후 식당을 즐겨찾기할 수 있습니다.");
      return;
    }

    const isFavorite = favorites.has(restaurant.id);
    const nextFavorites = new Set(favorites);
    const previousFavoriteIds = [...favorites];

    if (isFavorite) {
      nextFavorites.delete(restaurant.id);
    } else {
      nextFavorites.add(restaurant.id);
    }

    setFavoriteOverrideIds([...nextFavorites]);
    showNotice(isFavorite ? `${restaurant.name} 즐겨찾기를 해제했습니다.` : `${restaurant.name}을 즐겨찾기에 추가했습니다.`);

    const response = await fetch("/api/favorites", {
      method: isFavorite ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurantId: restaurant.id }),
    });

    if (!response.ok) {
      setFavoriteOverrideIds(previousFavoriteIds);
      const result = await response.json();
      showNotice(result.message ?? "즐겨찾기를 저장하지 못했습니다.");
    }
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-700">로컬 SQLite 데모</p>
            <h1 className="mt-1 text-3xl font-black text-slate-950">식당과 메뉴를 골라 주문해보세요</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/orders" className="rounded-md border border-emerald-600 bg-white px-4 py-2 text-center font-semibold text-emerald-700 hover:bg-emerald-100">
              주문확인하기
            </Link>
            <Link href="/cart" className="rounded-md bg-emerald-600 px-4 py-2 text-center font-semibold text-white hover:bg-emerald-700">
              장바구니 보기{totalCartCount > 0 ? ` (${totalCartCount})` : ""}
            </Link>
          </div>
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

      {selectedCategory === "즐겨찾기" && visibleRestaurants.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-600">
          아직 즐겨찾기한 식당이 없습니다.
        </div>
      ) : null}

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
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-black text-slate-950">{restaurant.name}</h2>
                      {favorites.has(restaurant.id) ? (
                        <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-black text-amber-700">즐겨찾기</span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{restaurant.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => toggleFavorite(restaurant)}
                      className={`rounded-md border px-3 py-2 text-sm font-black ${
                        favorites.has(restaurant.id)
                          ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
                          : "border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {favorites.has(restaurant.id) ? "즐겨찾기 해제" : "즐겨찾기"}
                    </button>
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
