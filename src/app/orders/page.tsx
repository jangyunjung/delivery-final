import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ReorderButton } from "@/components/ReorderButton";

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

export default async function OrdersPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-black text-slate-950">로그인이 필요합니다</h1>
        <p className="mt-2 text-slate-600">주문 내역은 로그인한 사용자만 확인할 수 있습니다.</p>
        <Link href="/login" className="mt-5 inline-flex rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700">
          로그인하러 가기
        </Link>
      </div>
    );
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      orderRestaurants: {
        include: {
          orderItems: true,
        },
        orderBy: { id: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-black text-slate-950">내 주문 내역</h1>
        <p className="mt-1 text-slate-600">{user.name}님의 주문만 표시됩니다.</p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-600">아직 주문 내역이 없습니다.</p>
          <Link href="/" className="mt-4 inline-flex rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700">
            첫 주문하기
          </Link>
        </div>
      ) : (
        <div className="grid gap-5">
          {orders.map((order) => (
            <article key={order.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-950">주문 #{order.id}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {new Intl.DateTimeFormat("ko-KR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-700">{order.status}</p>
                  <p className="text-2xl font-black text-slate-950">{formatPrice(order.totalPrice)}</p>
                </div>
                <ReorderButton
                  items={order.orderRestaurants.flatMap((orderRestaurant) =>
                    orderRestaurant.orderItems.map((item) => ({
                      menuItemId: item.menuItemId,
                      name: item.menuNameSnapshot,
                      price: item.priceSnapshot,
                      quantity: item.quantity,
                      restaurantId: orderRestaurant.restaurantId,
                      restaurantName: orderRestaurant.restaurantNameSnapshot,
                    }))
                  )}
                />
              </div>

              <div className="mt-4 grid gap-4">
                {order.orderRestaurants.map((orderRestaurant) => (
                  <section key={orderRestaurant.id} className="rounded-md bg-slate-50 p-4">
                    <div className="flex flex-wrap justify-between gap-2">
                      <div>
                        <h3 className="font-black text-slate-950">{orderRestaurant.restaurantNameSnapshot}</h3>
                        <p className="text-sm text-slate-600">상태: {orderRestaurant.status}</p>
                      </div>
                      <p className="font-bold text-slate-900">{formatPrice(orderRestaurant.restaurantSubtotal)}</p>
                    </div>
                    {orderRestaurant.restaurantRequest ? (
                      <p className="mt-2 rounded-md bg-white px-3 py-2 text-sm text-slate-700">
                        요청사항: {orderRestaurant.restaurantRequest}
                      </p>
                    ) : null}
                    <ul className="mt-3 grid gap-2">
                      {orderRestaurant.orderItems.map((item) => (
                        <li key={item.id} className="flex justify-between gap-3 text-sm">
                          <span className="font-semibold text-slate-800">
                            {item.menuNameSnapshot} x {item.quantity}
                          </span>
                          <span className="text-slate-700">{formatPrice(item.subtotal)}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
