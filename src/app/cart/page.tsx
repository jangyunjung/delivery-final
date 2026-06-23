import { CartView } from "@/components/CartView";
import { getCurrentUser } from "@/lib/session";

export default async function CartPage() {
  const user = await getCurrentUser();

  return <CartView isLoggedIn={Boolean(user)} />;
}
