"use client";

import { useSyncExternalStore } from "react";
import { getCartItems } from "@/lib/cart";
import type { CartItem } from "@/types/cart";

let cachedRaw = "";
let cachedItems: CartItem[] = [];
const emptyItems: CartItem[] = [];

function subscribe(onStoreChange: () => void) {
  window.addEventListener("cart-updated", onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener("cart-updated", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSnapshot() {
  const raw = localStorage.getItem("delivery-demo-cart") ?? "[]";

  if (raw === cachedRaw) {
    return cachedItems;
  }

  cachedRaw = raw;
  cachedItems = getCartItems();
  return cachedItems;
}

function getServerSnapshot() {
  return emptyItems;
}

export function useCartItems() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
