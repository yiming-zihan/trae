import { Calendar, Send, ShoppingCart, Sparkles, UtensilsCrossed, Search, ChefHat, Plus } from 'lucide-react';
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
    <div className="min-h-screen bg-pattern pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {!showSuccess ? (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6 animate-fade-up">
              <div className="glass-card rounded-3xl p-6 border border-dark-600/30">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 gradient-bg rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                    <Calendar className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white">选择制作日期</h2>
                    <p className="text-gray-400 mt-1">告诉我们您想什么时候享用这顿美食</p>
                  </div>
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-5 py-4 bg-dark-700/50 border border-dark-600 rounded-2xl text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 input-date text-lg"
                />
              </div>

              <div className="glass-card rounded-3xl p-6 border border-dark-600/30">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <ChefHat className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white">挑选菜品</h2>
                    <p className="text-gray-400 mt-1">选择今天想吃的美味佳肴</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="搜索菜品..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-all"
                    />
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
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

                <div className="grid md:grid-cols-2 gap-4">
                  {filteredDishes.map((dish, index) => {
                    const quantityInCart = getQuantityInCart(dish.id);
                    return (
                      <div
                        key={dish.id}
                        className="bg-dark-700/50 rounded-2xl border border-dark-600/30 overflow-hidden animate-fade-up group"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="relative">
                          <img
                            src={dish.imageUrl}
                            alt={dish.name}
                            className="w-full h-40 object-cover"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="px-3 py-1 bg-dark-800/80 text-gray-300 rounded-full text-sm font-medium backdrop-blur-sm">
                              {dish.category}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-bold text-white mb-1">{dish.name}</h3>
                          <p className="text-gray-400 text-sm mb-4 line-clamp-2">{dish.description}</p>
                          
                          {quantityInCart > 0 ? (
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => updateCartQuantity(dish.id, quantityInCart - 1)}
                                className="w-10 h-10 rounded-xl bg-dark-600 border border-dark-500 flex items-center justify-center hover:bg-dark-500 transition-all"
                              >
                                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              <span className="w-10 text-center font-bold text-white text-xl">{quantityInCart}</span>
                              <button
                                onClick={() => updateCartQuantity(dish.id, quantityInCart + 1)}
                                className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all"
                              >
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(dish)}
                              className="w-full py-3 gradient-bg text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
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

              {cart.length > 0 && (
                <div className="glass-card rounded-3xl p-6 border border-dark-600/30">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <ShoppingCart className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-white">已选菜品</h2>
                      <p className="text-gray-400 mt-1">共 {totalItems} 道美味佳肴</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {cart.map((item, index) => (
                      <div
                        key={item.dish.id}
                        className="flex gap-5 p-5 bg-dark-700/50 rounded-2xl border border-dark-600/30 animate-fade-up"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="relative w-28 h-28">
                          <img
                            src={item.dish.imageUrl}
                            alt={item.dish.name}
                            className="w-full h-full object-cover rounded-xl"
                          />
                          <div className="absolute -top-2 -right-2 w-7 h-7 gradient-bg rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                            {item.quantity}
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-white mb-1">{item.dish.name}</h3>
                            <p className="text-gray-400 text-sm">{item.dish.description}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateCartQuantity(item.dish.id, item.quantity - 1)}
                              className="w-10 h-10 rounded-xl bg-dark-600 border border-dark-500 flex items-center justify-center hover:bg-dark-500 transition-all"
                            >
                              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="w-10 text-center font-bold text-white text-xl">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.dish.id, item.quantity + 1)}
                              className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all"
                            >
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="animate-fade-up animate-delay-200">
              <div className="glass-card rounded-3xl p-6 border border-dark-600/30 sticky top-24">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500/20 rounded-2xl mb-4">
                    <Sparkles className="w-8 h-8 text-primary-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">确认下单</h3>
                  <p className="text-gray-400 text-sm mt-1">确认信息无误后提交</p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between py-3 border-b border-dark-600/30">
                    <span className="text-gray-400">菜品数量</span>
                    <span className="text-xl font-bold text-white">{totalItems} 道</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-dark-600/30">
                    <span className="text-gray-400">制作日期</span>
                    <span className="font-medium text-gray-200">{selectedDate}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-gray-400 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      下单时间
                    </span>
                    <span className="text-gray-300 text-sm">{new Date().toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleSubmitOrder}
                  disabled={cart.length === 0}
                  className={`w-full py-5 rounded-2xl font-bold text-xl transition-all duration-300 flex items-center justify-center gap-3 ${
                    cart.length === 0
                      ? 'bg-dark-600 text-gray-500 cursor-not-allowed'
                      : 'gradient-bg text-white shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  <Send className="w-6 h-6" />
                  提交给 {currentUser?.role === 'wife' ? '谢一鸣' : '赵梓涵'}
                </button>

                {currentUser?.role === 'wife' && (
                  <p className="text-center text-gray-500 text-sm mt-4">
                    提交后将发送微信消息通知老公
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto text-center py-20 animate-bounce-in">
            <div className="relative mb-10">
              <div className="absolute inset-0 bg-secondary-500/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="relative w-40 h-40 mx-auto bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-full flex items-center justify-center shadow-2xl">
                <Send className="w-20 h-20 text-white" />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-white mb-6">下单成功！</h2>
            <p className="text-xl text-gray-300 mb-3">
              {currentUser?.name} 已下单~
            </p>
            <p className="text-gray-400 mb-10">
              {currentUser?.role === 'wife' ? '谢一鸣' : '赵梓涵'} 已收到通知，正在准备美味佳肴
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Clock({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 900 11-18 0 9 900 0118 0z" />
    </svg>
  );
}
