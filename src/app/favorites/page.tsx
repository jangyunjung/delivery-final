import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function FavoritesPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-black text-slate-950">로그인이 필요합니다</h1>
        <p className="mt-2 text-slate-600">즐겨찾기한 음식점은 로그인한 사용자만 확인할 수 있습니다.</p>
        <Link href="/login" className="mt-5 inline-flex rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700">
          로그인하러 가기
        </Link>
      </div>
    );
  }

  const favoriteRestaurants = await prisma.favoriteRestaurant.findMany({
    where: { userId: user.id },
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
          category: true,
          description: true,
          menuItems: {
            select: {
              id: true,
              name: true,
              price: true,
            },
            orderBy: { id: "asc" },
            take: 3,
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-black text-slate-950">즐겨찾기한 음식점</h1>
        <p className="mt-1 text-slate-600">{user.name}님이 다시 찾기 쉽게 저장한 음식점입니다.</p>
      </div>

      {favoriteRestaurants.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-black text-slate-950">아직 즐겨찾기한 음식점이 없습니다.</p>
          <p className="mt-2 text-slate-600">메뉴 화면에서 마음에 드는 음식점을 즐겨찾기해보세요.</p>
          <Link href="/" className="mt-4 inline-flex rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700">
            음식점 보러 가기
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {favoriteRestaurants.map(({ restaurant }) => (
            <article key={restaurant.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-bold text-emerald-700">{restaurant.category}</p>
              <Link href={`/restaurants/${restaurant.id}`} className="mt-1 inline-flex text-2xl font-black text-slate-950 hover:text-emerald-700">
                {restaurant.name}
              </Link>
              <p className="mt-2 text-sm text-slate-600">{restaurant.description}</p>
              <div className="mt-4 rounded-md bg-slate-50 p-3">
                <p className="text-xs font-bold text-slate-500">대표 메뉴</p>
                <ul className="mt-2 grid gap-1 text-sm text-slate-700">
                  {restaurant.menuItems.map((menuItem) => (
                    <li key={menuItem.id} className="flex justify-between gap-3">
                      <span>{menuItem.name}</span>
                      <span>{menuItem.price.toLocaleString("ko-KR")}원</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link href={`/restaurants/${restaurant.id}`} className="mt-4 inline-flex rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700">
                메뉴 보기 / 주문하러 가기
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
