import { MenuBrowser } from "@/components/MenuBrowser";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export default async function Home() {
  const user = await getCurrentUser();
  const restaurants = await prisma.restaurant.findMany({
    select: {
      id: true,
      name: true,
      category: true,
      description: true,
      imageUrl: true,
      menuItems: {
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
        },
        orderBy: { id: "asc" },
      },
    },
    orderBy: { id: "asc" },
  });
  const favoriteRestaurantIds = user
    ? (
        await prisma.favoriteRestaurant.findMany({
          where: { userId: user.id },
          select: { restaurantId: true },
        })
      ).map((favorite) => favorite.restaurantId)
    : [];

  return (
    <MenuBrowser
      key={user?.id ?? "guest"}
      favoriteRestaurantIds={favoriteRestaurantIds}
      isLoggedIn={Boolean(user)}
      restaurants={restaurants}
    />
  );
}
