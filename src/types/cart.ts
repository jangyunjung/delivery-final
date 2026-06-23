export type CartItem = {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  restaurantId: number;
  restaurantName: string;
};

export type RestaurantWithMenus = {
  id: number;
  name: string;
  category: string;
  description: string;
  imageUrl: string | null;
  menuItems: {
    id: number;
    name: string;
    description: string;
    price: number;
  }[];
};
