import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

async function getRestaurantId(request: Request) {
  const { restaurantId } = await request.json();
  const parsedRestaurantId = Number(restaurantId);

  if (!Number.isInteger(parsedRestaurantId) || parsedRestaurantId <= 0) {
    return null;
  }

  return parsedRestaurantId;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "로그인 후 즐겨찾기할 수 있습니다." }, { status: 401 });
  }

  const restaurantId = await getRestaurantId(request);

  if (!restaurantId) {
    return NextResponse.json({ message: "식당 정보가 올바르지 않습니다." }, { status: 400 });
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { id: true },
  });

  if (!restaurant) {
    return NextResponse.json({ message: "존재하지 않는 식당입니다." }, { status: 404 });
  }

  await prisma.favoriteRestaurant.upsert({
    where: {
      userId_restaurantId: {
        userId: user.id,
        restaurantId,
      },
    },
    update: {},
    create: {
      userId: user.id,
      restaurantId,
    },
  });

  return NextResponse.json({ ok: true, isFavorite: true });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "로그인 후 즐겨찾기를 변경할 수 있습니다." }, { status: 401 });
  }

  const restaurantId = await getRestaurantId(request);

  if (!restaurantId) {
    return NextResponse.json({ message: "식당 정보가 올바르지 않습니다." }, { status: 400 });
  }

  await prisma.favoriteRestaurant.deleteMany({
    where: {
      userId: user.id,
      restaurantId,
    },
  });

  return NextResponse.json({ ok: true, isFavorite: false });
}
