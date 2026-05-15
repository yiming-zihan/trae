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
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

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
    setSelectedItems([]);
  };

  const isPurchased = (ingredientName: string) => {
    return purchaseSuccess.includes(ingredientName);
  };

  return (
    <div className="min-h-screen bg-pattern pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8 animate-fade-up">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">采购与清单</h1>
            <p className="text-gray-400 text-lg">查看待处理订单所需的食材采购清单</p>
          </div>
          <button
            onClick={() => handleNavigate('fridge')}
            className="flex items-center gap-2 px-6 py-3 glass-card border border-primary-500/30 text-primary-300 rounded-xl font-medium hover:bg-primary-500/10 transition-all"
          >
            <ChefHat className="w-5 h-5" />
            管理冰箱
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        {pendingOrders.length === 0 ? (
          <div className="glass-card rounded-3xl p-16 border border-dark-600/30 animate-fade-up text-center">
            <Package className="w-24 h-24 text-gray-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-3">暂无待处理订单</h2>
            <p className="text-gray-400 mb-6">先去点菜吧，然后在这里查看需要的食材</p>
            <button
              onClick={() => handleNavigate('order')}
              className="px-8 py-4 gradient-bg text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              去点菜
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 待处理订单详情 */}
            <div className="glass-card rounded-3xl p-8 border border-primary-500/20 animate-fade-up">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <ClipboardList className="w-7 h-7 text-primary-400" />
                待处理订单详情 ({pendingOrders.length})
              </h2>
              
              <div className="space-y-6">
                {pendingOrders.map((order, orderIndex) => {
                  const orderDishes = getOrderDishes(order.id);
                  return (
                    <div 
                      key={order.id} 
                      className="bg-dark-700/50 rounded-2xl p-6 border border-dark-600/30"
                      style={{ animationDelay: `${orderIndex * 100}ms` }}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <span className="text-gray-400 text-sm">制作日期</span>
                          <p className="text-2xl font-bold text-white">{order.targetDate}</p>
                        </div>
                        <span className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
                          待处理
                        </span>
                      </div>

                      <div className="space-y-6">
                        {orderDishes.map((item) => (
                          <div key={item.id} className="bg-dark-800/50 rounded-xl p-5 border border-dark-600/30">
                            <div className="flex items-center gap-4 mb-4">
                              <img 
                                src={item.dish?.imageUrl} 
                                alt={item.dish?.name}
                                className="w-16 h-16 rounded-xl object-cover"
                              />
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-white">{item.dish?.name}</h3>
                                <p className="text-gray-400 text-sm">× {item.quantity}</p>
                              </div>
                            </div>

                            <div className="border-t border-dark-600/30 pt-4">
                              <h4 className="text-sm font-semibold text-gray-300 mb-3">所需食材：</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {item.dish?.ingredients.map((ing) => {
                                  const totalNeeded = ing.amount * item.quantity;
                                  const ingredientInfo = ingredients.find(i => i.id === ing.ingredientId);
                                  const status = getIngredientStatus(ing.ingredientId, totalNeeded);
                                  
                                  return (
                                    <div 
                                      key={ing.ingredientId}
                                      className={`flex items-center justify-between p-3 rounded-lg ${
                                        status.status === 'enough' 
                                          ? 'bg-secondary-500/10 border border-secondary-500/20'
                                          : status.status === 'not_enough'
                                          ? 'bg-red-500/10 border border-red-500/20'
                                          : 'bg-gray-500/10 border border-gray-500/20'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        {status.status === 'enough' && (
                                          <CheckCircle className="w-5 h-5 text-secondary-400" />
                                        )}
                                        {status.status === 'not_enough' && (
                                          <XCircle className="w-5 h-5 text-red-400" />
                                        )}
                                        {status.status === 'not_found' && (
                                          <AlertTriangle className="w-5 h-5 text-gray-400" />
                                        )}
                                        <span className="text-white font-medium">
                                          {ingredientInfo?.name || ing.ingredientId}
                                        </span>
                                      </div>
                                      <div className="text-right">
                                        <p className={`font-semibold ${
                                          status.status === 'enough' ? 'text-secondary-400' : 'text-red-400'
                                        }`}>
                                          {status.inStock} / {status.needed}
                                          {status.status === 'not_enough' && (
                                            <span className="text-red-300 text-xs ml-1">
                                              (缺{status.missing})
                                            </span>
                                          )}
                                        </p>
                                        <p className="text-gray-500 text-xs">
                                          {ingredientInfo?.unit}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 采购清单 - 添加已采购功能 */}
            <div className="glass-card rounded-3xl p-8 border border-yellow-500/20 animate-fade-up animate-delay-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <ShoppingCart className="w-7 h-7 text-yellow-400" />
                  采购清单
                </h2>
                {needToBuy.length > 0 && (
                  <button
                    onClick={() => setShowPurchaseConfirm(true)}
                    className="px-6 py-3 gradient-bg text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    一键采购完成
                  </button>
                )}
              </div>
              
              {needToBuy.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                  <p className="text-xl text-secondary-400 font-semibold">太棒了！</p>
                  <p className="text-gray-400 mt-2">所有食材都已备齐，无需采购</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-2 text-red-400 font-semibold mb-2">
                      <AlertTriangle className="w-5 h-5" />
                      需要采购的食材 ({needToBuy.length})
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-dark-600">
                          <th className="text-left py-4 px-4 font-semibold text-gray-300">食材名称</th>
                          <th className="text-right py-4 px-4 font-semibold text-gray-300">单位</th>
                          <th className="text-right py-4 px-4 font-semibold text-gray-300">需要总量</th>
                          <th className="text-right py-4 px-4 font-semibold text-gray-300">现有库存</th>
                          <th className="text-right py-4 px-4 font-semibold text-gray-300">需要采购</th>
                          <th className="text-center py-4 px-4 font-semibold text-gray-300">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {needToBuy.map((ingredient, index) => {
                          const ingredientData = ingredients.find(i => i.name === ingredient.name);
                          const purchased = isPurchased(ingredient.name);
                          
                          return (
                            <tr 
                              key={ingredient.name} 
                              className={`border-b border-dark-600/30 last:border-0 animate-fade-up ${
                                purchased ? 'bg-secondary-500/10' : 'bg-yellow-500/5'
                              }`}
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              <td className="py-5 px-4">
                                <div className="flex items-center gap-2">
                                  {purchased ? (
                                    <>
                                      <CheckCircle className="w-5 h-5 text-secondary-400" />
                                      <span className="font-medium text-secondary-400 line-through">{ingredient.name}</span>
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-5 h-5 text-red-400" />
                                      <span className="font-medium text-white">{ingredient.name}</span>
                                    </>
                                  )}
                                </div>
                              </td>
                              <td className="py-5 px-4 text-right text-gray-400">{ingredient.unit}</td>
                              <td className="py-5 px-4 text-right text-gray-300 font-semibold">{ingredient.needed}</td>
                              <td className="py-5 px-4 text-right text-red-400">{ingredient.inStock}</td>
                              <td className="py-5 px-4 text-right">
                                {purchased ? (
                                  <span className="text-secondary-400 font-medium">已采购 ✓</span>
                                ) : (
                                  <span className="font-bold text-red-400 text-lg">+{ingredient.toBuy}</span>
                                )}
                              </td>
                              <td className="py-5 px-4 text-center">
                                {purchased ? (
                                  <span className="text-secondary-400 text-sm">✓ 已入库</span>
                                ) : (
                                  <button
                                    onClick={() => {
                                      if (ingredientData) {
                                        handlePurchase(ingredient.name, ingredientData.id, ingredient.toBuy, ingredient.unit);
                                      }
                                    }}
                                    className="px-4 py-2 bg-secondary-500/20 hover:bg-secondary-500/30 text-secondary-400 rounded-lg font-medium transition-all text-sm"
                                  >
                                    已采购
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-6 h-6" />
                      采购提示
                    </h3>
                    <ul className="space-y-2 text-gray-300">
                      {needToBuy.map((item) => {
                        const purchased = isPurchased(item.name);
                        return (
                          <li key={item.name} className="flex items-center gap-2">
                            <span className={purchased ? 'text-secondary-400' : 'text-red-400'}>•</span>
                            <span className={purchased ? 'line-through text-gray-500' : ''}>
                              {item.name}: {purchased ? '已采购 ✓' : `需采购 ${item.toBuy}${item.unit}`}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {purchaseSuccess.length > 0 && (
                    <div className="mt-4 p-4 bg-secondary-500/20 border border-secondary-500/30 rounded-xl text-secondary-400 text-center">
                      <CheckCircle className="w-5 h-5 inline-block mr-2" />
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
            <div className="glass-card rounded-2xl p-8 w-full max-w-md border border-dark-600/30 animate-bounce-in">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-secondary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 text-secondary-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">确认采购完成</h3>
                <p className="text-gray-400">以下食材将被添加到冰箱库存：</p>
              </div>

              <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
                {needToBuy.map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg">
                    <span className="text-white font-medium">{item.name}</span>
                    <span className="text-secondary-400 font-bold">+{item.toBuy} {item.unit}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPurchaseConfirm(false)}
                  className="flex-1 py-3 bg-dark-600 text-gray-300 rounded-xl font-semibold hover:bg-dark-500 transition-all"
                >
                  取消
                </button>
                <button
                  onClick={handleBatchPurchase}
                  className="flex-1 py-3 gradient-bg text-white rounded-xl font-bold shadow-xl shadow-secondary-500/30 hover:shadow-secondary-500/50 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  确认采购
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
