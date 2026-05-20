export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  inStock: number;
}

export interface Dish {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  ingredients: { ingredientId: string; amount: number }[];
}

export interface OrderItem {
  id: string;
  dishId: string;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  status: 'pending' | 'accepted' | 'preparing' | 'completed' | 'cancelled';
  targetDate: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  dish: Dish;
  quantity: number;
}

export type Role = 'wife' | 'husband';

export interface User {
  id: string;
  name: string;
  role: Role;
  wechatId: string | null;
}

export interface FridgeItem {
  id: string;
  name: string;
  category: '冷藏' | '冷冻' | '常温' | '其他' | '卤味' | '海鲜' | '水果' | '酒水';
  unit: string;
  quantity: number;
  expiryDate?: string;
  addedDate: string;
  notes?: string;
  ingredientId?: string;
}