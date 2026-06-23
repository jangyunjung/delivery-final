import { MenuBrowser } from "@/components/MenuBrowser";
import { prisma } from "@/lib/prisma";

export default async function Home() {
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

  return <MenuBrowser restaurants={restaurants} />;
}
