import { create } from 'zustand';
import { CartItem, Dish, Ingredient, Order, User, FridgeItem } from '@/types';
import { mockDishes, mockIngredients, mockOrders } from '@/data/mockData';
import { firebaseService } from '@/firebase/firebaseService';

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
    quantity: 7,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i5'
  },
  {
    id: 'f3',
    name: '黄瓜',
    category: '冷藏',
    unit: '根',
    quantity: 3,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i7'
  },
  {
    id: 'f4',
    name: '猪肉',
    category: '冷冻',
    unit: '克',
    quantity: 200,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i11'
  },
  {
    id: 'f5',
    name: '西兰花',
    category: '冷藏',
    unit: '颗',
    quantity: 2,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i2'
  },
  {
    id: 'f6',
    name: '葱',
    category: '常温',
    unit: '根',
    quantity: 5,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i15'
  },
  {
    id: 'f7',
    name: '蒜',
    category: '常温',
    unit: '瓣',
    quantity: 30,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i17'
  },
  {
    id: 'f8',
    name: '姜',
    category: '常温',
    unit: '片',
    quantity: 15,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i16'
  },
  {
    id: 'f9',
    name: '生抽',
    category: '常温',
    unit: '毫升',
    quantity: 300,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i18'
  },
  {
    id: 'f10',
    name: '豆腐',
    category: '冷藏',
    unit: '块',
    quantity: 3,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i9'
  },
  {
    id: 'f11',
    name: '鸡胸肉',
    category: '冷冻',
    unit: '克',
    quantity: 300,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i1'
  },
  {
    id: 'f12',
    name: '胡萝卜',
    category: '冷藏',
    unit: '根',
    quantity: 6,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i3'
  },
  {
    id: 'f13',
    name: '土豆',
    category: '常温',
    unit: '个',
    quantity: 4,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i4'
  },
  {
    id: 'f14',
    name: '虾仁',
    category: '冷冻',
    unit: '克',
    quantity: 150,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i8'
  },
  {
    id: 'f15',
    name: '青椒',
    category: '冷藏',
    unit: '个',
    quantity: 4,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i10'
  },
  {
    id: 'f16',
    name: '白菜',
    category: '冷藏',
    unit: '颗',
    quantity: 1,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i12'
  },
  {
    id: 'f17',
    name: '木耳',
    category: '常温',
    unit: '克',
    quantity: 50,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i13'
  },
  {
    id: 'f18',
    name: '香菇',
    category: '冷藏',
    unit: '朵',
    quantity: 12,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i14'
  },
  {
    id: 'f19',
    name: '料酒',
    category: '常温',
    unit: '毫升',
    quantity: 200,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i19'
  },
  {
    id: 'f20',
    name: '盐',
    category: '常温',
    unit: '克',
    quantity: 150,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i20'
  },
  {
    id: 'f21',
    name: '杏鲍菇',
    category: '冷藏',
    unit: '个',
    quantity: 3,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i21'
  },
  {
    id: 'f22',
    name: '油麦菜',
    category: '冷藏',
    unit: '棵',
    quantity: 2,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i22'
  },
  {
    id: 'f23',
    name: '娃娃菜',
    category: '冷藏',
    unit: '棵',
    quantity: 1,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i23'
  },
  {
    id: 'f24',
    name: '粉丝',
    category: '常温',
    unit: '包',
    quantity: 5,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i24'
  },
  {
    id: 'f25',
    name: '鱼肉',
    category: '冷冻',
    unit: '克',
    quantity: 200,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i25'
  },
  {
    id: 'f26',
    name: '牛蛙',
    category: '冷冻',
    unit: '只',
    quantity: 2,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i26'
  },
  {
    id: 'f27',
    name: '蒜蓉',
    category: '冷藏',
    unit: '克',
    quantity: 50,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i27'
  },
  {
    id: 'f28',
    name: '猪耳朵',
    category: '卤味',
    unit: '个',
    quantity: 2,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i28'
  },
  {
    id: 'f29',
    name: '干豆腐',
    category: '冷藏',
    unit: '张',
    quantity: 10,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i29'
  },
  {
    id: 'f30',
    name: '花生米',
    category: '常温',
    unit: '克',
    quantity: 100,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i30'
  },
  {
    id: 'f31',
    name: '扇贝',
    category: '海鲜',
    unit: '个',
    quantity: 6,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i31'
  },
  {
    id: 'f32',
    name: '小龙虾',
    category: '海鲜',
    unit: '斤',
    quantity: 2,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i32'
  },
  {
    id: 'f33',
    name: '三文鱼',
    category: '海鲜',
    unit: '片',
    quantity: 6,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i33'
  },
  {
    id: 'f34',
    name: '鸭头',
    category: '卤味',
    unit: '个',
    quantity: 4,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i34'
  },
  {
    id: 'f35',
    name: '羊排',
    category: '冷冻',
    unit: '块',
    quantity: 3,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i35'
  },
  {
    id: 'f36',
    name: '意面',
    category: '常温',
    unit: '包',
    quantity: 1,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i36'
  },
  {
    id: 'f37',
    name: '大樱桃',
    category: '水果',
    unit: '斤',
    quantity: 1,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i37'
  },
  {
    id: 'f38',
    name: '串茄',
    category: '水果',
    unit: '盒',
    quantity: 1,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i38'
  },
  {
    id: 'f39',
    name: '苹果汁',
    category: '酒水',
    unit: '瓶',
    quantity: 1,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i39'
  },
  {
    id: 'f40',
    name: '鲜打扎啤',
    category: '酒水',
    unit: '升',
    quantity: 2,
    addedDate: new Date().toISOString().split('T')[0],
    ingredientId: 'i40'
  }
];

// 从 localStorage 加载数据
const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
};

// 保存数据到 localStorage
const saveToLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};

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
  deleteOrder: (orderId: string) => void;
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

export const useMenuStore = create<MenuStore>((set, get) => {
  // 初始化默认用户
  const initialUsers: User[] = [
    { id: 'u1', name: '赵梓涵', role: 'wife', wechatId: 'pushplus_configured' },
    { id: 'u2', name: '谢一鸣', role: 'husband', wechatId: 'pushplus_configured' },
  ];

  // 从 localStorage 加载持久化数据
  const savedIngredients = loadFromLocalStorage('ingredients', mockIngredients);
  const savedOrders = loadFromLocalStorage('orders', mockOrders);
  const savedFridgeItems = loadFromLocalStorage('fridgeItems', defaultFridgeItems);
  const savedCurrentUser = loadFromLocalStorage('currentUser', initialUsers[0]);

  // 自动初始化 PushPlus 配置
  const initNotificationConfigs = () => {
    const zihanConfig = {
      service: 'pushplus',
      token: '150357f7830e47099fa0605f516659af',
      configTime: new Date().toISOString()
    };
    const yimingConfig = {
      service: 'pushplus',
      token: 'd848b9e85ae04afca1b04f4e7a943308',
      configTime: new Date().toISOString()
    };

    if (!localStorage.getItem('notification_config_u1')) {
      localStorage.setItem('notification_config_u1', JSON.stringify(zihanConfig));
    }
    if (!localStorage.getItem('notification_config_u2')) {
      localStorage.setItem('notification_config_u2', JSON.stringify(yimingConfig));
    }
  };

  initNotificationConfigs();

  // Firebase 同步函数
  const syncOrdersToFirebase = async (orders: Order[]) => {
    try {
      await firebaseService.saveOrders(orders);
    } catch (error) {
      console.warn('Failed to sync orders to Firebase:', error);
    }
  };

  const syncIngredientsToFirebase = async (ingredients: Ingredient[]) => {
    try {
      await firebaseService.saveIngredients(ingredients);
    } catch (error) {
      console.warn('Failed to sync ingredients to Firebase:', error);
    }
  };

  const syncFridgeItemsToFirebase = async (fridgeItems: FridgeItem[]) => {
    try {
      await firebaseService.saveFridgeItems(fridgeItems);
    } catch (error) {
      console.warn('Failed to sync fridge items to Firebase:', error);
    }
  };

  // 监听 Firebase 变化
  const subscribeToFirebaseUpdates = () => {
    firebaseService.subscribeToOrders((orders) => {
      set({ orders });
      saveToLocalStorage('orders', orders);
    });

    firebaseService.subscribeToIngredients((ingredients) => {
      set({ ingredients });
      saveToLocalStorage('ingredients', ingredients);
    });

    firebaseService.subscribeToFridgeItems((fridgeItems) => {
      set({ fridgeItems });
      saveToLocalStorage('fridgeItems', fridgeItems);
    });
  };

  // 从 Firebase 初始化数据
  const initFromFirebase = async () => {
    try {
      const [fbOrders, fbIngredients, fbFridgeItems] = await Promise.all([
        firebaseService.loadOrders(),
        firebaseService.loadIngredients(),
        firebaseService.loadFridgeItems(),
      ]);

      if (fbOrders.length > 0) {
        set({ orders: fbOrders });
        saveToLocalStorage('orders', fbOrders);
      }
      if (fbIngredients.length > 0) {
        set({ ingredients: fbIngredients });
        saveToLocalStorage('ingredients', fbIngredients);
      }
      if (fbFridgeItems.length > 0) {
        set({ fridgeItems: fbFridgeItems });
        saveToLocalStorage('fridgeItems', fbFridgeItems);
      }

      // 如果 Firebase 为空，初始化数据
      if (fbOrders.length === 0) {
        await firebaseService.saveOrders(savedOrders);
      }
      if (fbIngredients.length === 0) {
        await firebaseService.saveIngredients(savedIngredients);
      }
      if (fbFridgeItems.length === 0) {
        await firebaseService.saveFridgeItems(savedFridgeItems);
      }

      // 开始监听
      subscribeToFirebaseUpdates();
    } catch (error) {
      console.warn('Failed to initialize from Firebase:', error);
    }
  };

  // 延迟初始化 Firebase
  setTimeout(initFromFirebase, 1000);

  return {
    dishes: mockDishes,
    ingredients: savedIngredients,
    orders: savedOrders,
    users: initialUsers,
    currentUser: savedCurrentUser,
    cart: [],
    selectedDate: new Date().toISOString().split('T')[0],
    searchQuery: '',
    selectedCategory: '全部',
    fridgeItems: savedFridgeItems,

    setCurrentUser: (user) => {
      set({ currentUser: user });
      saveToLocalStorage('currentUser', user);
    },

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

      const updatedOrders = [newOrder, ...get().orders];
      set({ orders: updatedOrders });
      saveToLocalStorage('orders', updatedOrders);
      
      syncOrdersToFirebase(updatedOrders);
      
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
      set((state) => {
        const order = state.orders.find((o) => o.id === orderId);
        
        // 如果订单状态从pending变为completed，需要减少库存
        if (order && order.status === 'pending' && status === 'completed') {
          // 计算所有菜品需要的食材
          const ingredientUsage = new Map<string, number>();
          
          order.items.forEach((item) => {
            const dish = state.dishes.find((d) => d.id === item.dishId);
            if (dish) {
              dish.ingredients.forEach((ing) => {
                const current = ingredientUsage.get(ing.ingredientId) || 0;
                ingredientUsage.set(ing.ingredientId, current + ing.amount * item.quantity);
              });
            }
          });

          // 更新食材库存
          const updatedIngredients = state.ingredients.map((ing) => {
            const usage = ingredientUsage.get(ing.id) || 0;
            return {
              ...ing,
              inStock: Math.max(0, ing.inStock - usage)
            };
          });

          // 更新冰箱物品
          const updatedFridgeItems = state.fridgeItems.map((fridgeItem) => {
            if (!fridgeItem.ingredientId) return fridgeItem;
            const usage = ingredientUsage.get(fridgeItem.ingredientId) || 0;
            if (usage <= 0) return fridgeItem;
            
            const newQuantity = Math.max(0, fridgeItem.quantity - usage);
            return {
              ...fridgeItem,
              quantity: newQuantity
            };
          });

          const updatedOrders = state.orders.map((o) =>
            o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o
          );

          saveToLocalStorage('orders', updatedOrders);
          saveToLocalStorage('ingredients', updatedIngredients);
          saveToLocalStorage('fridgeItems', updatedFridgeItems);

          syncOrdersToFirebase(updatedOrders);
          syncIngredientsToFirebase(updatedIngredients);
          syncFridgeItemsToFirebase(updatedFridgeItems);

          return {
            orders: updatedOrders,
            ingredients: updatedIngredients,
            fridgeItems: updatedFridgeItems
          };
        }

        const updatedOrders = state.orders.map((o) =>
          o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o
        );
        saveToLocalStorage('orders', updatedOrders);
        syncOrdersToFirebase(updatedOrders);

        return {
          orders: updatedOrders,
        };
      }),

    updateIngredientStock: (ingredientId, quantity) =>
      set((state) => {
        const updatedIngredients = state.ingredients.map((ing) =>
          ing.id === ingredientId ? { ...ing, inStock: quantity } : ing
        );
        saveToLocalStorage('ingredients', updatedIngredients);
        return { ingredients: updatedIngredients };
      }),

    deleteOrder: (orderId) =>
      set((state) => {
        const updatedOrders = state.orders.filter((o) => o.id !== orderId);
        saveToLocalStorage('orders', updatedOrders);
        syncOrdersToFirebase(updatedOrders);
        return { orders: updatedOrders };
      }),

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

      const updatedFridgeItems = [...get().fridgeItems, newItem];
      set({ fridgeItems: updatedFridgeItems });
      saveToLocalStorage('fridgeItems', updatedFridgeItems);

      if (newItem.ingredientId) {
        const ingredient = get().ingredients.find((i) => i.id === newItem.ingredientId);
        if (ingredient) {
          get().updateIngredientStock(newItem.ingredientId, ingredient.inStock + newItem.quantity);
        }
      }
    },

    updateFridgeItem: (id, updates) => {
      const oldItem = get().fridgeItems.find((item) => item.id === id);
      
      const updatedFridgeItems = get().fridgeItems.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      );
      set({ fridgeItems: updatedFridgeItems });
      saveToLocalStorage('fridgeItems', updatedFridgeItems);

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
      
      const updatedFridgeItems = get().fridgeItems.filter((item) => item.id !== id);
      set({ fridgeItems: updatedFridgeItems });
      saveToLocalStorage('fridgeItems', updatedFridgeItems);

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

      const updatedIngredients = ingredients.map((ing) => ({
        ...ing,
        inStock: ingredientStockMap.get(ing.id) || ing.inStock,
      }));
      set({ ingredients: updatedIngredients });
      saveToLocalStorage('ingredients', updatedIngredients);
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
    }
  };
});
