import { Calendar, Send, ShoppingCart, Sparkles, UtensilsCrossed, Search, ChefHat, Plus, Minus } from 'lucide-react';
import { useMenuStore } from '@/store/menuStore';
import { useState } from 'react';

const categories = ['全部', '家常菜', '川菜', '粤菜', '凉菜', '特色菜', '时蔬', '蒸菜', '火锅'];

export function OrderPage() {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    selectedDate,
    setSelectedDate,
    createOrder,
    dishes,
    currentUser,
    addToCart,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
  } = useMenuStore();
  const [showSuccess, setShowSuccess] = useState(false);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredDishes = dishes.filter((dish) => {
    const matchesSearch = !searchQuery || dish.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === '全部' || dish.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getQuantityInCart = (dishId: string) => {
    const item = cart.find((item) => item.dish.id === dishId);
    return item ? item.quantity : 0;
  };

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;
    const order = await createOrder(cart, selectedDate);
    if (order) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-pattern pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-3 md:px-4">
        {!showSuccess ? (
          <>
            {/* 日期选择 - 手机端固定在顶部 */}
            <div className="glass-card rounded-xl md:rounded-2xl p-3 md:p-6 mb-4 border border-dark-600/30 sticky top-20 z-40 bg-dark-800/95 backdrop-blur-xl">
              <div className="flex items-center gap-3 md:gap-4 mb-3">
                <div className="w-10 h-10 md:w-14 md:h-14 gradient-bg rounded-lg md:rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                  <Calendar className="w-5 h-5 md:w-7 md:h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-sm md:text-2xl font-bold text-white">选择制作日期</h2>
                  <p className="text-xs md:text-sm text-gray-400">告诉我们您想什么时候享用这顿美食</p>
                </div>
              </div>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-700/50 border border-dark-600 rounded-lg md:rounded-2xl text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm md:text-lg"
                />
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <Calendar className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            </div>

            {/* 搜索和分类 */}
            <div className="glass-card rounded-xl md:rounded-2xl p-4 md:p-6 mb-4 border border-dark-600/30">
              <div className="flex items-center gap-3 md:gap-4 mb-4">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg md:rounded-2xl flex items-center justify-center shadow-lg">
                  <ChefHat className="w-5 h-5 md:w-7 md:h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-sm md:text-2xl font-bold text-white">挑选菜品</h2>
                  <p className="text-xs md:text-sm text-gray-400">选择今天想吃的美味佳肴</p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索菜品..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 md:py-3 bg-dark-700 border border-dark-600 rounded-lg md:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-all text-sm"
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl font-medium whitespace-nowrap transition-all text-sm ${
                        selectedCategory === category
                          ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                          : 'bg-dark-700 text-gray-300 hover:bg-dark-600 border border-dark-600'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 菜品列表 - 手机端两列，平板两列，桌面三列 */}
            <div className="glass-card rounded-xl md:rounded-2xl p-3 md:p-6 mb-4 border border-dark-600/30">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {filteredDishes.map((dish, index) => {
                  const quantityInCart = getQuantityInCart(dish.id);
                  return (
                    <div
                      key={dish.id}
                      className="bg-dark-700/50 rounded-xl md:rounded-2xl border border-dark-600/30 overflow-hidden animate-fade-up group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="relative">
                        <img
                          src={dish.imageUrl}
                          alt={dish.name}
                          className="w-full h-32 md:h-40 object-cover"
                        />
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-0.5 md:px-3 md:py-1 bg-dark-800/80 text-gray-300 rounded-full text-xs md:text-sm font-medium backdrop-blur-sm">
                            {dish.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-3 md:p-4">
                        <h3 className="text-sm md:text-lg font-bold text-white mb-1">{dish.name}</h3>
                        <p className="text-gray-400 text-xs md:text-sm mb-3 line-clamp-2">{dish.description}</p>
                        
                        {quantityInCart > 0 ? (
                          <div className="flex items-center gap-2 md:gap-3">
                            <button
                              onClick={() => updateCartQuantity(dish.id, quantityInCart - 1)}
                              className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-dark-600 border border-dark-500 flex items-center justify-center hover:bg-dark-500 transition-all"
                            >
                              <Minus className="w-3 h-3 md:w-4 md:h-4 text-gray-300" />
                            </button>
                            <span className="w-8 md:w-10 text-center font-bold text-white text-lg md:text-xl">{quantityInCart}</span>
                            <button
                              onClick={() => updateCartQuantity(dish.id, quantityInCart + 1)}
                              className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all"
                            >
                              <Plus className="w-3 h-3 md:w-4 md:h-4 text-white" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(dish)}
                            className="w-full py-2 md:py-3 gradient-bg text-white rounded-lg md:rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-1 md:gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            添加
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 已选菜品和下单 - 手机端固定在底部 */}
            {cart.length > 0 && (
              <div className="fixed bottom-0 left-0 right-0 z-50 p-3 md:p-0">
                <div className="max-w-7xl mx-auto">
                  <div className="glass-card rounded-xl md:rounded-2xl border-t border-dark-600/30 bg-dark-800/95 backdrop-blur-xl">
                    <div className="p-4 md:p-6">
                      <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg md:rounded-2xl flex items-center justify-center shadow-lg">
                          <ShoppingCart className="w-5 h-5 md:w-7 md:h-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-sm md:text-2xl font-bold text-white">已选菜品</h2>
                          <p className="text-xs md:text-sm text-gray-400">共 {totalItems} 道美味佳肴</p>
                        </div>
                      </div>

                      {/* 手机端显示已选菜品预览 */}
                      <div className="hidden md:block space-y-3">
                        {cart.map((item, index) => (
                          <div
                            key={item.dish.id}
                            className="flex gap-4 p-4 bg-dark-700/50 rounded-xl border border-dark-600/30 animate-fade-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div className="relative w-20 h-20 md:w-28 md:h-28">
                              <img
                                src={item.dish.imageUrl}
                                alt={item.dish.name}
                                className="w-full h-full object-cover rounded-lg md:rounded-xl"
                              />
                              <div className="absolute -top-1 -right-1 w-6 h-6 md:w-7 md:h-7 gradient-bg rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg">
                                {item.quantity}
                              </div>
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <h3 className="text-base md:text-xl font-bold text-white mb-1">{item.dish.name}</h3>
                                <p className="text-gray-400 text-xs md:text-sm">{item.dish.description}</p>
                              </div>
                              <div className="flex items-center gap-2 md:gap-3">
                                <button
                                  onClick={() => updateCartQuantity(item.dish.id, item.quantity - 1)}
                                  className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-dark-600 border border-dark-500 flex items-center justify-center hover:bg-dark-500 transition-all"
                                >
                                  <Minus className="w-3 h-3 md:w-4 md:h-4 text-gray-300" />
                                </button>
                                <span className="w-8 md:w-10 text-center font-bold text-white text-lg md:text-xl">{item.quantity}</span>
                                <button
                                  onClick={() => updateCartQuantity(item.dish.id, item.quantity + 1)}
                                  className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all"
                                >
                                  <Plus className="w-3 h-3 md:w-4 md:h-4 text-white" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* 手机端简化的已选菜品列表 */}
                      <div className="md:hidden flex flex-wrap gap-2 mb-4">
                        {cart.map((item) => (
                          <div key={item.dish.id} className="flex items-center gap-2 px-3 py-2 bg-dark-700 rounded-lg">
                            <img src={item.dish.imageUrl} alt={item.dish.name} className="w-10 h-10 rounded-lg object-cover" />
                            <span className="text-white font-medium text-sm">{item.dish.name}</span>
                            <span className="text-primary-400 font-bold">×{item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* 下单按钮 */}
                      <button
                        onClick={handleSubmitOrder}
                        disabled={cart.length === 0}
                        className={`w-full py-3 md:py-5 rounded-xl md:rounded-2xl font-bold text-sm md:text-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                          cart.length === 0
                            ? 'bg-dark-600 text-gray-500 cursor-not-allowed'
                            : 'gradient-bg text-white shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                      >
                        <Send className="w-4 h-4 md:w-6 md:h-6" />
                        提交给 {currentUser?.role === 'wife' ? '谢一鸣' : '赵梓涵'}
                      </button>

                      {currentUser?.role === 'wife' && (
                        <p className="text-center text-gray-500 text-xs md:text-sm mt-2 md:mt-4">
                          提交后将发送微信消息通知老公
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="max-w-lg mx-auto text-center py-12 md:py-20 animate-bounce-in">
            <div className="relative mb-6 md:mb-10">
              <div className="absolute inset-0 bg-secondary-500/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="relative w-28 h-28 md:w-40 md:h-40 mx-auto bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-full flex items-center justify-center shadow-2xl">
                <Send className="w-14 h-14 md:w-20 md:h-20 text-white" />
              </div>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 md:mb-6">下单成功！</h2>
            <p className="text-base md:text-xl text-gray-300 mb-2 md:mb-3">
              {currentUser?.name} 已下单~
            </p>
            <p className="text-gray-400 text-sm md:text-base">
              {currentUser?.role === 'wife' ? '谢一鸣' : '赵梓涵'} 已收到通知，正在准备美味佳肴
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
