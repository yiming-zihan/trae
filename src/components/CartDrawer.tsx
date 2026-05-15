import { X, Minus, Plus, Trash2, Calendar, Send, ShoppingBag, UtensilsCrossed } from 'lucide-react';
import { useMenuStore } from '@/store/menuStore';
import { useState } from 'react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, updateCartQuantity, removeFromCart, selectedDate, setSelectedDate, createOrder, currentUser } =
    useMenuStore();
  const [showSuccess, setShowSuccess] = useState(false);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmitOrder = () => {
    if (cart.length === 0) return;
    const order = createOrder(cart, selectedDate);
    if (order) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-up" 
        onClick={onClose}
      ></div>
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-dark-800/95 backdrop-blur-2xl z-50 shadow-2xl flex flex-col border-l border-dark-600 animate-slide-in">
        {!showSuccess ? (
          <>
            <div className="flex items-center justify-between p-6 border-b border-dark-600/50">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-primary-400" />
                  点菜清单
                </h2>
                <p className="text-gray-400 text-sm mt-1">共 {totalItems} 道菜</p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center hover:bg-dark-600 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 border-b border-dark-600/30">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary-400" />
                <span className="text-gray-300 font-medium">制作日期</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 input-date"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                  <div className="w-24 h-24 bg-dark-700 rounded-full flex items-center justify-center mb-6">
                    <UtensilsCrossed className="w-12 h-12 text-gray-500" />
                  </div>
                  <p className="text-gray-400 text-lg mb-2">还没有选择菜品</p>
                  <p className="text-gray-500 text-sm">快去首页挑选美味吧~</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.dish.id}
                    className="flex gap-4 p-4 bg-dark-700/50 rounded-2xl border border-dark-600/30"
                  >
                    <img
                      src={item.dish.imageUrl}
                      alt={item.dish.name}
                      className="w-24 h-24 object-cover rounded-xl"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-white text-lg">{item.dish.name}</h4>
                        <p className="text-gray-400 text-sm mt-1">{item.dish.category}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateCartQuantity(item.dish.id, item.quantity - 1)}
                          className="w-9 h-9 rounded-xl bg-dark-600 border border-dark-500 flex items-center justify-center hover:bg-dark-500 transition-colors"
                        >
                          <Minus className="w-4 h-4 text-gray-300" />
                        </button>
                        <span className="w-8 text-center font-bold text-white text-lg">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.dish.id, item.quantity + 1)}
                          className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center hover:shadow-lg hover:shadow-primary-500/30 transition-all"
                        >
                          <Plus className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.dish.id)}
                          className="ml-auto text-rose-400 hover:text-rose-300 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-dark-600/50">
                <button
                  onClick={handleSubmitOrder}
                  className="w-full py-4 rounded-2xl font-bold text-lg gradient-bg text-white shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <Send className="w-6 h-6" />
                  提交给 {currentUser?.role === 'wife' ? '谢一鸣' : '赵梓涵'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-bounce-in">
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-secondary-500/20 rounded-full animate-pulse absolute inset-0 mx-auto"></div>
              <div className="relative w-32 h-32 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-full flex items-center justify-center shadow-2xl">
                <Send className="w-16 h-16 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">下单成功！</h2>
            <p className="text-gray-300 text-lg mb-2">
              {currentUser?.name} 已下单~
            </p>
            <p className="text-gray-400">
              {currentUser?.role === 'wife' ? '谢一鸣' : '赵梓涵'} 已收到通知
            </p>
          </div>
        )}
      </div>
    </>
  );
}
