import { db } from './config';
import { ref, set, get, onValue, update, remove } from 'firebase/database';
import { Ingredient, Dish, Order, FridgeItem, User } from '@/types';

const DATA_PATH = '';

export const firebaseService = {
  saveIngredients: async (ingredients: Ingredient[]) => {
    try {
      console.log('📤 Saving ingredients to Firebase:', ingredients);
      await set(ref(db, `${DATA_PATH}/ingredients`), ingredients);
      console.log('✅ Ingredients saved successfully');
    } catch (error) {
      console.error('❌ Failed to save ingredients to Firebase:', error);
      throw error;
    }
  },

  loadIngredients: async (): Promise<Ingredient[]> => {
    try {
      console.log('📥 Loading ingredients from Firebase...');
      const snapshot = await get(ref(db, `${DATA_PATH}/ingredients`));
      const ingredients = snapshot.exists() ? snapshot.val() : [];
      console.log('✅ Ingredients loaded:', ingredients);
      return ingredients;
    } catch (error) {
      console.error('❌ Failed to load ingredients from Firebase:', error);
      return [];
    }
  },

  saveDishes: async (dishes: Dish[]) => {
    await set(ref(db, `${DATA_PATH}/dishes`), dishes);
  },

  loadDishes: async (): Promise<Dish[]> => {
    const snapshot = await get(ref(db, `${DATA_PATH}/dishes`));
    return snapshot.exists() ? snapshot.val() : [];
  },

  saveOrders: async (orders: Order[]) => {
    try {
      console.log('📤 Saving orders to Firebase:', orders);
      await set(ref(db, `${DATA_PATH}/orders`), orders);
      console.log('✅ Orders saved successfully');
    } catch (error) {
      console.error('❌ Failed to save orders to Firebase:', error);
      throw error;
    }
  },

  loadOrders: async (): Promise<Order[]> => {
    try {
      console.log('📥 Loading orders from Firebase...');
      const snapshot = await get(ref(db, `${DATA_PATH}/orders`));
      const orders = snapshot.exists() ? snapshot.val() : [];
      console.log('✅ Orders loaded:', orders);
      return orders;
    } catch (error) {
      console.error('❌ Failed to load orders from Firebase:', error);
      return [];
    }
  },

  saveFridgeItems: async (fridgeItems: FridgeItem[]) => {
    try {
      console.log('📤 Saving fridge items to Firebase:', fridgeItems);
      await set(ref(db, `${DATA_PATH}/fridgeItems`), fridgeItems);
      console.log('✅ Fridge items saved successfully');
    } catch (error) {
      console.error('❌ Failed to save fridge items to Firebase:', error);
      throw error;
    }
  },

  loadFridgeItems: async (): Promise<FridgeItem[]> => {
    try {
      console.log('📥 Loading fridge items from Firebase...');
      const snapshot = await get(ref(db, `${DATA_PATH}/fridgeItems`));
      const fridgeItems = snapshot.exists() ? snapshot.val() : [];
      console.log('✅ Fridge items loaded:', fridgeItems);
      return fridgeItems;
    } catch (error) {
      console.error('❌ Failed to load fridge items from Firebase:', error);
      return [];
    }
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
    console.log('🔍 Subscribing to orders at:', `${DATA_PATH}/orders`);
    
    onValue(ordersRef, (snapshot) => {
      try {
        const orders = snapshot.exists() ? snapshot.val() : [];
        console.log('📦 Orders snapshot received:', orders);
        callback(orders);
      } catch (error) {
        console.error('❌ Error in orders subscription:', error);
        callback([]);
      }
    }, (error) => {
      console.error('❌ Firebase orders subscription error:', error);
    });
  },

  subscribeToIngredients: (callback: (ingredients: Ingredient[]) => void) => {
    const ingredientsRef = ref(db, `${DATA_PATH}/ingredients`);
    console.log('🔍 Subscribing to ingredients at:', `${DATA_PATH}/ingredients`);
    
    onValue(ingredientsRef, (snapshot) => {
      try {
        const ingredients = snapshot.exists() ? snapshot.val() : [];
        console.log('📦 Ingredients snapshot received:', ingredients);
        callback(ingredients);
      } catch (error) {
        console.error('❌ Error in ingredients subscription:', error);
        callback([]);
      }
    }, (error) => {
      console.error('❌ Firebase ingredients subscription error:', error);
    });
  },

  subscribeToFridgeItems: (callback: (fridgeItems: FridgeItem[]) => void) => {
    const fridgeRef = ref(db, `${DATA_PATH}/fridgeItems`);
    console.log('🔍 Subscribing to fridge items at:', `${DATA_PATH}/fridgeItems`);
    
    onValue(fridgeRef, (snapshot) => {
      try {
        const fridgeItems = snapshot.exists() ? snapshot.val() : [];
        console.log('📦 Fridge items snapshot received:', fridgeItems);
        callback(fridgeItems);
      } catch (error) {
        console.error('❌ Error in fridge items subscription:', error);
        callback([]);
      }
    }, (error) => {
      console.error('❌ Firebase fridge items subscription error:', error);
    });
  },
};
