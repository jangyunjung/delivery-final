import { notFound } from "next/navigation";
import { RestaurantDetail } from "@/components/RestaurantDetail";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { withStableRestaurantImage } from "@/lib/restaurant-images";

export default async function RestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const restaurantId = Number(id);

  if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
    notFound();
  }

  const user = await getCurrentUser();
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
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
  });

  if (!restaurant) {
    notFound();
  }

  const favorite = user
    ? await prisma.favoriteRestaurant.findUnique({
        where: {
          userId_restaurantId: {
            userId: user.id,
            restaurantId,
          },
        },
        select: { id: true },
      })
    : null;

  return <RestaurantDetail initialIsFavorite={Boolean(favorite)} isLoggedIn={Boolean(user)} restaurant={withStableRestaurantImage(restaurant)} />;
}
