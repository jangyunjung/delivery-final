"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CartItem, RestaurantWithMenus } from "@/types/cart";

const CART_KEY = "delivery-demo-cart";

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

function readCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? "[]") as CartItem[];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart-updated"));
}

export function MenuBrowser({ restaurants }: { restaurants: RestaurantWithMenus[] }) {
  const [notice, setNotice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");

  const categories = useMemo(() => ["전체", ...new Set(restaurants.map((restaurant) => restaurant.category))], [restaurants]);
  const visibleRestaurants =
    selectedCategory === "전체"
      ? restaurants
      : restaurants.filter((restaurant) => restaurant.category === selectedCategory);

  function addToCart(restaurant: RestaurantWithMenus, menuItem: RestaurantWithMenus["menuItems"][number]) {
    const cart = readCart();
    const existingItem = cart.find((item) => item.menuItemId === menuItem.id);

    if (existingItem) {
      existingItem.quantity += 1;
      writeCart(cart);
    } else {
      writeCart([
        ...cart,
        {
          menuItemId: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1,
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
        },
      ]);
    }

    setNotice(`${menuItem.name}을 장바구니에 담았습니다.`);
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
            장바구니 보기
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

      {notice ? <p className="rounded-md bg-slate-900 px-4 py-3 text-sm font-semibold text-white">{notice}</p> : null}

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
