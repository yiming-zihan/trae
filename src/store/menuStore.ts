import { create } from 'zustand';
import { CartItem, Dish, Ingredient, Order, User, FridgeItem } from '@/types';
import { mockDishes, mockIngredients, mockOrders, mockUsers } from '@/data/mockData';

interface MenuStore {
  dishes: Dish[];
  ingredients: Ingredient[];
  orders: Order[];
  users: User[];
  currentUser: User | null;
  cart: CartItem[];
  selectedDate: string;
  searchQuery: string;
  selectedCategory: string;
  fridgeItems: FridgeItem[];

  setCurrentUser: (user: User) => void;
  addToCart: (dish: Dish) => void;
  removeFromCart: (dishId: string) => void;
  updateCartQuantity: (dishId: string, quantity: number) => void;
  clearCart: () => void;
  setSelectedDate: (date: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  createOrder: (items: CartItem[], date: string) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateIngredientStock: (ingredientId: string, quantity: number) => void;
  getFilteredDishes: () => Dish[];
  getShoppingList: (dishes: Dish[]) => { name: string; unit: string; needed: number; inStock: number; toBuy: number }[];
  getPendingOrders: () => Order[];
  
  addFridgeItem: (item: Omit<FridgeItem, 'id' | 'addedDate'>) => void;
  updateFridgeItem: (id: string, item: Partial<FridgeItem>) => void;
  removeFridgeItem: (id: string) => void;
  syncFridgeToInventory: () => void;
  sendNotification: (userId: string, title: string, content: string) => Promise<boolean>;
}

// 初始化默认冰箱食材
const defaultFridgeItems: FridgeItem[] = [
  {
    id: 'f1',
    name: '鸡蛋',
    category: '冷藏',
    unit: '个',
    quantity: 15,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i6'
  },
  {
    id: 'f2',
    name: '西红柿',
    category: '冷藏',
    unit: '个',
    quantity: 8,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i5'
  },
  {
    id: 'f3',
    name: '黄瓜',
    category: '冷藏',
    unit: '根',
    quantity: 5,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i7'
  },
  {
    id: 'f4',
    name: '猪肉',
    category: '冷冻',
    unit: '克',
    quantity: 500,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i11'
  },
  {
    id: 'f5',
    name: '西兰花',
    category: '冷藏',
    unit: '颗',
    quantity: 3,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i2'
  },
  {
    id: 'f6',
    name: '葱',
    category: '常温',
    unit: '根',
    quantity: 8,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i15'
  },
  {
    id: 'f7',
    name: '蒜',
    category: '常温',
    unit: '瓣',
    quantity: 40,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i17'
  },
  {
    id: 'f8',
    name: '姜',
    category: '常温',
    unit: '片',
    quantity: 30,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i16'
  },
  {
    id: 'f9',
    name: '生抽',
    category: '常温',
    unit: '毫升',
    quantity: 400,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i18'
  },
  {
    id: 'f10',
    name: '豆腐',
    category: '冷藏',
    unit: '块',
    quantity: 4,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i9'
  }
];

export const useMenuStore = create<MenuStore>((set, get) => ({
  dishes: mockDishes,
  ingredients: mockIngredients,
  orders: mockOrders,
  users: mockUsers,
  currentUser: mockUsers[0],
  cart: [],
  selectedDate: new Date().toISOString().split('T')[0],
  searchQuery: '',
  selectedCategory: '全部',
  fridgeItems: defaultFridgeItems,

  setCurrentUser: (user) => set({ currentUser: user }),

  addToCart: (dish) =>
    set((state) => {
      const existing = state.cart.find((item) => item.dish.id === dish.id);
      if (existing) {
        return {
          cart: state.cart.map((item) =>
            item.dish.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
          ),
        };
      }
      return { cart: [...state.cart, { dish, quantity: 1 }] };
    }),

  removeFromCart: (dishId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.dish.id !== dishId),
    })),

  updateCartQuantity: (dishId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return { cart: state.cart.filter((item) => item.dish.id !== dishId) };
      }
      return {
        cart: state.cart.map((item) =>
          item.dish.id === dishId ? { ...item, quantity } : item
        ),
      };
    }),

  clearCart: () => set({ cart: [] }),

  setSelectedDate: (date) => set({ selectedDate: date }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSelectedCategory: (category) => set({ selectedCategory: category }),

  createOrder: async (items, date) => {
    if (items.length === 0) return null;

    const newOrder: Order = {
      id: `o${Date.now()}`,
      userId: get().currentUser?.id || 'u1',
      status: 'pending',
      targetDate: date,
      items: items.map((item) => ({
        id: `oi${Date.now()}-${item.dish.id}`,
        dishId: item.dish.id,
        quantity: item.quantity,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({ orders: [newOrder, ...state.orders] }));
    get().clearCart();

    const { currentUser, sendNotification } = get();

    const orderDetails = items.map(item => 
      `• ${item.dish.name} × ${item.quantity}`
    ).join('\n');

    const notificationTitle = currentUser?.id === 'u1'
      ? '🍳 新的点菜通知' 
      : '✅ 订单已提交';

    const notificationContent = `
**${currentUser?.name || '用户'}** 提交了新的点菜订单

**点菜日期：** ${date}

**菜品清单：**
${orderDetails}

---
时间：${new Date().toLocaleString('zh-CN')}
    `;

    const notifyUserId = currentUser?.id === 'u1' ? 'u2' : 'u1';
    await sendNotification(notifyUserId, notificationTitle, notificationContent);

    return newOrder;
  },

  updateOrderStatus: (orderId, status) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, status, updatedAt: new Date().toISOString() } : order
      ),
    })),

  updateIngredientStock: (ingredientId, quantity) =>
    set((state) => ({
      ingredients: state.ingredients.map((ing) =>
        ing.id === ingredientId ? { ...ing, inStock: quantity } : ing
      ),
    })),

  getFilteredDishes: () => {
    const { dishes, searchQuery, selectedCategory } = get();
    return dishes.filter((dish) => {
      const matchesSearch =
        !searchQuery || dish.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === '全部' || dish.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  },

  getShoppingList: (dishes) => {
    const { ingredients } = get();
    const ingredientMap = new Map<string, number>();

    dishes.forEach((dish) => {
      dish.ingredients.forEach((ing) => {
        const current = ingredientMap.get(ing.ingredientId) || 0;
        ingredientMap.set(ing.ingredientId, current + ing.amount);
      });
    });

    return Array.from(ingredientMap.entries()).map(([id, needed]) => {
      const ing = ingredients.find((i) => i.id === id);
      if (!ing) return null;
      const toBuy = Math.max(0, needed - ing.inStock);
      return {
        name: ing.name,
        unit: ing.unit,
        needed,
        inStock: ing.inStock,
        toBuy,
      };
    }).filter(Boolean) as { name: string; unit: string; needed: number; inStock: number; toBuy: number }[];
  },

  getPendingOrders: () => {
    return get().orders.filter((order) => order.status === 'pending');
  },

  addFridgeItem: (item) => {
    const newItem: FridgeItem = {
      ...item,
      id: `f${Date.now()}`,
      addedDate: new Date().toISOString().split('T')[0],
    };

    set((state) => ({
      fridgeItems: [...state.fridgeItems, newItem],
    }));

    if (newItem.ingredientId) {
      const ingredient = get().ingredients.find((i) => i.id === newItem.ingredientId);
      if (ingredient) {
        get().updateIngredientStock(newItem.ingredientId, ingredient.inStock + newItem.quantity);
      }
    }
  },

  updateFridgeItem: (id, updates) => {
    const oldItem = get().fridgeItems.find((item) => item.id === id);
    
    set((state) => ({
      fridgeItems: state.fridgeItems.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));

    if (oldItem?.ingredientId && updates.quantity !== undefined) {
      const ingredient = get().ingredients.find((i) => i.id === oldItem.ingredientId);
      if (ingredient) {
        const diff = updates.quantity - oldItem.quantity;
        get().updateIngredientStock(oldItem.ingredientId, Math.max(0, ingredient.inStock + diff));
      }
    }
  },

  removeFridgeItem: (id) => {
    const item = get().fridgeItems.find((item) => item.id === id);
    
    set((state) => ({
      fridgeItems: state.fridgeItems.filter((item) => item.id !== id),
    }));

    if (item?.ingredientId) {
      const ingredient = get().ingredients.find((i) => i.id === item.ingredientId);
      if (ingredient) {
        get().updateIngredientStock(item.ingredientId, Math.max(0, ingredient.inStock - item.quantity));
      }
    }
  },

  syncFridgeToInventory: () => {
    const { fridgeItems, ingredients } = get();
    
    const ingredientStockMap = new Map<string, number>();
    ingredients.forEach((ing) => {
      ingredientStockMap.set(ing.id, 0);
    });

    fridgeItems.forEach((item) => {
      if (item.ingredientId) {
        const current = ingredientStockMap.get(item.ingredientId) || 0;
        ingredientStockMap.set(item.ingredientId, current + item.quantity);
      }
    });

    set((state) => ({
      ingredients: state.ingredients.map((ing) => ({
        ...ing,
        inStock: ingredientStockMap.get(ing.id) || ing.inStock,
      })),
    }));
  },

  sendNotification: async (userId: string, title: string, content: string) => {
    const configData = localStorage.getItem(`notification_config_${userId}`);
    if (!configData) return false;
    
    const config = JSON.parse(configData);
    
    try {
      if (config.service === 'pushplus' && config.token) {
        await fetch('https://www.pushplus.plus/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: config.token,
            title,
            content,
            template: 'html'
          })
        });
        return true;
      }

      if (config.service === 'serverchan' && config.token) {
        await fetch(`https://sctapi.ftqq.com/${config.token}.send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `title=${encodeURIComponent(title)}&desp=${encodeURIComponent(content)}`
        });
        return true;
      }

      if (config.service === 'wework' && config.webhookUrl) {
        await fetch(config.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            msgtype: 'markdown',
            markdown: {
              content: `**${title}**\n\n${content}`
            }
          })
        });
        return true;
      }

      if (config.service === 'email') {
        console.log('邮件通知:', title, content);
        return true;
      }

      return false;
    } catch (error) {
      console.error('发送通知失败:', error);
      return false;
    }
  },
}));
