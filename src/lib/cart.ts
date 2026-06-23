import type { CartItem } from "@/types/cart";

export const CART_KEY = "delivery-demo-cart";

export function getCartItems(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const items = JSON.parse(localStorage.getItem(CART_KEY) ?? "[]") as CartItem[];
    return items.filter((item) => item.menuItemId && item.quantity > 0);
  } catch {
    return [];
  }
}

export function saveCartItems(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart-updated"));
}

export function clearCartItems() {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event("cart-updated"));
}

export function getCartItemCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function getRestaurantCartCount(items: CartItem[], restaurantId: number) {
  return items
    .filter((item) => item.restaurantId === restaurantId)
    .reduce((sum, item) => sum + item.quantity, 0);
}

export function mergeCartItems(currentItems: CartItem[], newItems: CartItem[]) {
  const mergedItems = [...currentItems];

  for (const newItem of newItems) {
    const existingItem = mergedItems.find((item) => item.menuItemId === newItem.menuItemId);

    if (existingItem) {
      existingItem.quantity += newItem.quantity;
    } else {
      mergedItems.push(newItem);
    }
  }

  return mergedItems;
}
