import { db } from './config';
import { ref, set, get, onValue, update, remove } from 'firebase/database';
import { Ingredient, Dish, Order, FridgeItem, User } from '@/types';

const DATA_PATH = 'zihan-kitchen';

export const firebaseService = {
  saveIngredients: async (ingredients: Ingredient[]) => {
    await set(ref(db, `${DATA_PATH}/ingredients`), ingredients);
  },

  loadIngredients: async (): Promise<Ingredient[]> => {
    const snapshot = await get(ref(db, `${DATA_PATH}/ingredients`));
    return snapshot.exists() ? snapshot.val() : [];
  },

  saveDishes: async (dishes: Dish[]) => {
    await set(ref(db, `${DATA_PATH}/dishes`), dishes);
  },

  loadDishes: async (): Promise<Dish[]> => {
    const snapshot = await get(ref(db, `${DATA_PATH}/dishes`));
    return snapshot.exists() ? snapshot.val() : [];
  },

  saveOrders: async (orders: Order[]) => {
    await set(ref(db, `${DATA_PATH}/orders`), orders);
  },

  loadOrders: async (): Promise<Order[]> => {
    const snapshot = await get(ref(db, `${DATA_PATH}/orders`));
    return snapshot.exists() ? snapshot.val() : [];
  },

  saveFridgeItems: async (fridgeItems: FridgeItem[]) => {
    await set(ref(db, `${DATA_PATH}/fridgeItems`), fridgeItems);
  },

  loadFridgeItems: async (): Promise<FridgeItem[]> => {
    const snapshot = await get(ref(db, `${DATA_PATH}/fridgeItems`));
    return snapshot.exists() ? snapshot.val() : [];
  },

  saveUsers: async (users: User[]) => {
    await set(ref(db, `${DATA_PATH}/users`), users);
  },

  loadUsers: async (): Promise<User[]> => {
    const snapshot = await get(ref(db, `${DATA_PATH}/users`));
    return snapshot.exists() ? snapshot.val() : [];
  },

  saveSettings: async (settings: any) => {
    await set(ref(db, `${DATA_PATH}/settings`), settings);
  },

  loadSettings: async (): Promise<any> => {
    const snapshot = await get(ref(db, `${DATA_PATH}/settings`));
    return snapshot.exists() ? snapshot.val() : {};
  },

  subscribeToOrders: (callback: (orders: Order[]) => void) => {
    const ordersRef = ref(db, `${DATA_PATH}/orders`);
    onValue(ordersRef, (snapshot) => {
      const orders = snapshot.exists() ? snapshot.val() : [];
      callback(orders);
    });
  },

  subscribeToIngredients: (callback: (ingredients: Ingredient[]) => void) => {
    const ingredientsRef = ref(db, `${DATA_PATH}/ingredients`);
    onValue(ingredientsRef, (snapshot) => {
      const ingredients = snapshot.exists() ? snapshot.val() : [];
      callback(ingredients);
    });
  },

  subscribeToFridgeItems: (callback: (fridgeItems: FridgeItem[]) => void) => {
    const fridgeRef = ref(db, `${DATA_PATH}/fridgeItems`);
    onValue(fridgeRef, (snapshot) => {
      const fridgeItems = snapshot.exists() ? snapshot.val() : [];
      callback(fridgeItems);
    });
  },
};
