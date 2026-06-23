import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

type CartItemInput = {
  menuItemId: number;
  quantity: number;
};

type OrderInput = {
  items: CartItemInput[];
  restaurantRequests?: Record<string, string>;
};

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "로그인 후 주문할 수 있습니다." }, { status: 401 });
  }

  const body = (await request.json()) as OrderInput;
  const items = (body.items ?? [])
    .map((item) => ({
      menuItemId: Number(item.menuItemId),
      quantity: Number(item.quantity),
    }))
    .filter((item) => Number.isInteger(item.menuItemId) && item.menuItemId > 0 && item.quantity > 0);

  if (items.length === 0) {
    return NextResponse.json({ message: "장바구니가 비어 있습니다." }, { status: 400 });
  }

  const menuItems = await prisma.menuItem.findMany({
    where: {
      id: { in: items.map((item) => item.menuItemId) },
    },
    include: { restaurant: true },
  });

  if (menuItems.length !== new Set(items.map((item) => item.menuItemId)).size) {
    return NextResponse.json({ message: "존재하지 않는 메뉴가 포함되어 있습니다." }, { status: 400 });
  }

  const menuById = new Map(menuItems.map((menuItem) => [menuItem.id, menuItem]));
  const groupedItems = new Map<
    number,
    {
      restaurantId: number;
      restaurantName: string;
      subtotal: number;
      items: {
        menuItemId: number;
        menuName: string;
        price: number;
        quantity: number;
        subtotal: number;
      }[];
    }
  >();

  for (const item of items) {
    const menuItem = menuById.get(item.menuItemId);

    if (!menuItem) {
      continue;
    }

    const subtotal = menuItem.price * item.quantity;
    const group = groupedItems.get(menuItem.restaurantId) ?? {
      restaurantId: menuItem.restaurantId,
      restaurantName: menuItem.restaurant.name,
      subtotal: 0,
      items: [],
    };

    group.subtotal += subtotal;
    group.items.push({
      menuItemId: menuItem.id,
      menuName: menuItem.name,
      price: menuItem.price,
      quantity: item.quantity,
      subtotal,
    });
    groupedItems.set(menuItem.restaurantId, group);
  }

  const orderGroups = [...groupedItems.values()];
  const totalPrice = orderGroups.reduce((sum, group) => sum + group.subtotal, 0);

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      totalPrice,
      orderRestaurants: {
        create: orderGroups.map((group) => ({
          restaurantId: group.restaurantId,
          restaurantNameSnapshot: group.restaurantName,
          restaurantRequest: body.restaurantRequests?.[String(group.restaurantId)]?.trim() || null,
          restaurantSubtotal: group.subtotal,
          orderItems: {
            create: group.items.map((item) => ({
              menuItemId: item.menuItemId,
              menuNameSnapshot: item.menuName,
              priceSnapshot: item.price,
              quantity: item.quantity,
              subtotal: item.subtotal,
            })),
          },
        })),
      },
    },
  });

  return NextResponse.json({ ok: true, orderId: order.id });
}
