import { ShoppingCart, ChefHat, ClipboardList, ExternalLink, AlertTriangle, CheckCircle, XCircle, Package, ShoppingBag } from 'lucide-react';
import { useMenuStore } from '@/store/menuStore';
import { useState } from 'react';

interface InventoryPageProps {
  onNavigateToPage?: (page: string) => void;
}

export function InventoryPage({ onNavigateToPage }: InventoryPageProps) {
  const { orders, dishes, ingredients, getShoppingList, fridgeItems, addFridgeItem, updateFridgeItem } = useMenuStore();
  const [purchaseSuccess, setPurchaseSuccess] = useState<string[]>([]);
  const [showPurchaseConfirm, setShowPurchaseConfirm] = useState(false);

  const pendingOrders = orders.filter((order) => order.status === 'pending');

  const getOrderDishes = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return [];
    return order.items.map((item) => {
      const dish = dishes.find((d) => d.id === item.dishId);
      return { ...item, dish };
    }).filter((item) => item.dish);
  };

  const getAllPendingOrderDishes = () => {
    const allItems: any[] = [];
    pendingOrders.forEach(order => {
      const orderDishes = getOrderDishes(order.id);
      orderDishes.forEach(item => {
        allItems.push(item);
      });
    });
    return allItems;
  };

  const allPendingDishes = getAllPendingOrderDishes();
  const validDishes = allPendingDishes.filter(item => item.dish).map(item => item.dish);
  const shoppingList = getShoppingList(validDishes);

  const needToBuy = shoppingList.filter(item => item.toBuy > 0);

  const handleNavigate = (page: string) => {
    if (onNavigateToPage) {
      onNavigateToPage(page);
    } else {
      window.location.href = `/?page=${page}`;
    }
  };

  const getIngredientStatus = (ingredientId: string, neededAmount: number) => {
    const ingredient = ingredients.find(i => i.id === ingredientId);
    if (!ingredient) {
      return { status: 'not_found', inStock: 0, needed: neededAmount };
    }
    
    const fridgeItem = fridgeItems.find(f => f.ingredientId === ingredientId);
    const actualStock = fridgeItem ? fridgeItem.quantity : ingredient.inStock;
    
    if (actualStock >= neededAmount) {
      return { status: 'enough', inStock: actualStock, needed: neededAmount };
    } else {
      return { status: 'not_enough', inStock: actualStock, needed: neededAmount, missing: neededAmount - actualStock };
    }
  };

  const handlePurchase = (ingredientName: string, ingredientId: string, toBuyAmount: number, unit: string) => {
    const existingFridgeItem = fridgeItems.find(f => f.ingredientId === ingredientId);
    
    if (existingFridgeItem) {
      updateFridgeItem(existingFridgeItem.id, {
        quantity: existingFridgeItem.quantity + toBuyAmount
      });
    } else {
      addFridgeItem({
        name: ingredientName,
        category: '冷藏',
        unit,
        quantity: toBuyAmount,
        ingredientId
      });
    }
    
    setPurchaseSuccess(prev => [...prev, ingredientName]);
    setTimeout(() => {
      setPurchaseSuccess(prev => prev.filter(name => name !== ingredientName));
    }, 3000);
  };

  const handleBatchPurchase = () => {
    needToBuy.forEach(item => {
      const ingredient = ingredients.find(i => i.name === item.name);
      if (ingredient) {
        handlePurchase(item.name, ingredient.id, item.toBuy, item.unit);
      }
    });
    setShowPurchaseConfirm(false);
  };

  const isPurchased = (ingredientName: string) => {
    return purchaseSuccess.includes(ingredientName);
  };

  return (
    <div className="min-h-screen bg-pattern pt-20 pb-20">
      <div className="max-w-6xl mx-auto px-3 md:px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-white mb-1">采购与清单</h1>
            <p className="text-gray-400 text-sm md:text-base">待处理订单所需食材</p>
          </div>
          <button
            onClick={() => handleNavigate('fridge')}
            className="flex items-center justify-center gap-2 px-4 py-2 glass-card border border-primary-500/30 text-primary-300 rounded-xl font-medium hover:bg-primary-500/10 transition-all text-sm"
          >
            <ChefHat className="w-4 h-4" />
            管理冰箱
          </button>
        </div>

        {pendingOrders.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 border border-dark-600/30 text-center">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">暂无待处理订单</h2>
            <p className="text-gray-400 mb-4">先去点菜吧</p>
            <button
              onClick={() => handleNavigate('order')}
              className="px-6 py-3 gradient-bg text-white rounded-xl font-bold hover:shadow-lg transition-all text-sm"
            >
              去点菜
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 待处理订单摘要 */}
            <div className="glass-card rounded-2xl p-4 md:p-6 border border-primary-500/20">
              <h2 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-primary-400" />
                待处理订单 ({pendingOrders.length})
              </h2>
              
              <div className="space-y-3">
                {pendingOrders.map((order, orderIndex) => {
                  const orderDishes = getOrderDishes(order.id);
                  return (
                    <div 
                      key={order.id} 
                      className="bg-dark-700/50 rounded-xl p-3 md:p-4 border border-dark-600/30"
                      style={{ animationDelay: `${orderIndex * 50}ms` }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-gray-400 text-xs">制作日期</span>
                          <p className="text-lg font-bold text-white">{order.targetDate}</p>
                        </div>
                        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
                          待处理
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {orderDishes.map((item) => (
                          <div key={item.id} className="flex items-center gap-2 px-3 py-2 bg-dark-800/50 rounded-lg">
                            <img 
                              src={item.dish?.imageUrl} 
                              alt={item.dish?.name}
                              className="w-8 h-8 rounded-lg object-cover"
                            />
                            <div>
                              <span className="text-white text-sm font-medium">{item.dish?.name}</span>
                              <span className="text-primary-400 text-xs ml-1">×{item.quantity}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* 食材状态摘要 */}
                      <div className="mt-3 pt-3 border-t border-dark-600/30">
                        <div className="flex flex-wrap gap-2">
                          {orderDishes.flatMap(item => 
                            item.dish?.ingredients.map((ing) => {
                              const totalNeeded = ing.amount * item.quantity;
                              const status = getIngredientStatus(ing.ingredientId, totalNeeded);
                              const ingredientInfo = ingredients.find(i => i.id === ing.ingredientId);
                              
                              return (
                                <span 
                                  key={ing.ingredientId}
                                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs ${
                                    status.status === 'enough' 
                                      ? 'bg-secondary-500/10 text-secondary-400'
                                      : 'bg-red-500/10 text-red-400'
                                  }`}
                                >
                                  {status.status === 'enough' ? (
                                    <CheckCircle className="w-3 h-3" />
                                  ) : (
                                    <XCircle className="w-3 h-3" />
                                  )}
                                  {ingredientInfo?.name}
                                </span>
                              );
                            })
                          ).slice(0, 6)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 采购清单 */}
            <div className="glass-card rounded-2xl p-4 md:p-6 border border-yellow-500/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-yellow-400" />
                  采购清单
                </h2>
                {needToBuy.length > 0 && (
                  <button
                    onClick={() => setShowPurchaseConfirm(true)}
                    className="px-4 py-2 gradient-bg text-white rounded-lg font-bold text-sm hover:shadow-lg transition-all flex items-center gap-1"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    一键采购
                  </button>
                )}
              </div>
              
              {needToBuy.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-secondary-400 mx-auto mb-3" />
                  <p className="text-lg text-secondary-400 font-semibold">太棒了！</p>
                  <p className="text-gray-400 text-sm">所有食材都已备齐</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-red-400 font-semibold">
                      <AlertTriangle className="w-4 h-4" />
                      需要采购 {needToBuy.length} 种食材
                    </div>
                  </div>

                  {/* 紧凑网格布局 */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {needToBuy.map((ingredient, index) => {
                      const ingredientData = ingredients.find(i => i.name === ingredient.name);
                      const purchased = isPurchased(ingredient.name);
                      
                      return (
                        <div 
                          key={ingredient.name} 
                          className={`p-2.5 rounded-lg border transition-all ${
                            purchased 
                              ? 'bg-secondary-500/10 border-secondary-500/20' 
                              : 'bg-dark-700/50 border-dark-600/30 hover:border-yellow-500/30'
                          }`}
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <div className="flex items-start gap-1.5 mb-1.5">
                            {purchased ? (
                              <CheckCircle className="w-3.5 h-3.5 text-secondary-400 flex-shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                            )}
                            <span className={`text-sm font-medium truncate flex-1 ${purchased ? 'text-secondary-400 line-through' : 'text-white'}`}>
                              {ingredient.name}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs">
                            <span className={`font-semibold ${purchased ? 'text-secondary-400' : 'text-red-400'}`}>
                              {purchased ? '已采购' : `${ingredient.toBuy}${ingredient.unit}`}
                            </span>
                            <span className="text-gray-500">库存:{ingredient.inStock}</span>
                          </div>
                          
                          {!purchased && ingredientData && (
                            <button
                              onClick={() => handlePurchase(ingredient.name, ingredientData.id, ingredient.toBuy, ingredient.unit)}
                              className="mt-2 w-full py-1.5 bg-secondary-500/20 hover:bg-secondary-500/30 text-secondary-400 rounded-md font-medium text-xs transition-all"
                            >
                              采购
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {purchaseSuccess.length > 0 && (
                    <div className="p-3 bg-secondary-500/20 border border-secondary-500/30 rounded-xl text-secondary-400 text-center">
                      <CheckCircle className="w-4 h-4 inline-block mr-1" />
                      已将 {purchaseSuccess.length} 种食材添加到冰箱！
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 一键采购确认弹窗 */}
        {showPurchaseConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card rounded-2xl p-6 w-full max-w-sm border border-dark-600/30">
              <div className="text-center">
                <div className="w-12 h-12 bg-secondary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-6 h-6 text-secondary-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">确认采购完成</h3>
                <p className="text-gray-400 text-sm mb-4">以下食材将被添加到冰箱：</p>

                <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
                  {needToBuy.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-2 bg-dark-700/50 rounded-lg">
                      <span className="text-white text-sm">{item.name}</span>
                      <span className="text-secondary-400 font-bold text-sm">+{item.toBuy} {item.unit}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPurchaseConfirm(false)}
                    className="flex-1 py-2 bg-dark-600 text-gray-300 rounded-lg font-semibold hover:bg-dark-500 transition-all text-sm"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleBatchPurchase}
                    className="flex-1 py-2 gradient-bg text-white rounded-lg font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    确认采购
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
