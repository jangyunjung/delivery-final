const stableRestaurantImages: Record<string, string> = {
  온기한상: "/restaurant-images/1.png",
  담백갈비탕: "/restaurant-images/2.png",
  홍등반점: "/restaurant-images/3.png",
  마라공방: "/restaurant-images/4.png",
  스시하루: "/restaurant-images/9.jpeg",
  "라멘야 밤": "/restaurant-images/5.png",
  브릭오븐피자: "/restaurant-images/6.png",
  파스타랩: "/restaurant-images/7.png",
  사이공키친: "/restaurant-images/10.jpeg",
  타이바질: "/restaurant-images/11.jpeg",
  버거스테이션: "/restaurant-images/8.png",
  크리스피치킨앤랩: "/restaurant-images/12.jpeg",
  모닝브루: "/restaurant-images/13.jpeg",
  달콤베이크: "/restaurant-images/14.jpeg",
};

export function withStableRestaurantImage<T extends { name: string; imageUrl: string | null }>(restaurant: T): T {
  return {
    ...restaurant,
    imageUrl: stableRestaurantImages[restaurant.name] ?? restaurant.imageUrl,
  };
}

export function withStableRestaurantImages<T extends { name: string; imageUrl: string | null }>(restaurants: T[]): T[] {
  return restaurants.map(withStableRestaurantImage);
}
