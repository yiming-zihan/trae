import { History, Check, Clock, AlertCircle, ChefHat, CalendarDays, Trash2 } from 'lucide-react';
import { useMenuStore } from '@/store/menuStore';
import { useState } from 'react';

export function HistoryPage() {
  const { orders, dishes, updateOrderStatus, deleteOrder } = useMenuStore();
  const [deleteConfirmOrderId, setDeleteConfirmOrderId] = useState<string | null>(null);
  const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: '待确认', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock };
      case 'accepted':
        return { label: '已接受', color: 'bg-blue-500/20 text-blue-400', icon: Check };
      case 'preparing':
        return { label: '制作中', color: 'bg-orange-500/20 text-orange-400', icon: ChefHat };
      case 'completed':
        return { label: '已完成', color: 'bg-secondary-500/20 text-secondary-400', icon: Check };
      case 'cancelled':
        return { label: '已取消', color: 'bg-red-500/20 text-red-400', icon: AlertCircle };
      default:
        return { label: status, color: 'bg-gray-500/20 text-gray-400', icon: AlertCircle };
    }
  };

  const getOrderDishes = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return [];
    return order.items.map((item) => {
      const dish = dishes.find((d) => d.id === item.dishId);
      return { ...item, dish };
    }).filter((item) => item.dish);
  };

  const getNextStatus = (status: 'pending' | 'accepted' | 'preparing' | 'completed' | 'cancelled') => {
    switch (status) {
      case 'pending':
        return 'accepted';
      case 'accepted':
        return 'preparing';
      case 'preparing':
        return 'completed';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-pattern pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8 animate-fade-up">
          <div className="w-16 h-16 mx-auto bg-dark-700/50 rounded-2xl flex items-center justify-center mb-4 border border-dark-600/30">
            <History className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">订单历史</h1>
          <p className="text-gray-400">查看所有的美食记录</p>
        </div>

        {sortedOrders.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center border border-dark-600/30 animate-fade-up">
            <div className="w-20 h-20 bg-dark-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CalendarDays className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">还没有订单记录</h3>
            <p className="text-gray-400">快去首页开始第一单吧~</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedOrders.map((order, index) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;
              const orderDishes = getOrderDishes(order.id);
              const canProgress = ['pending', 'accepted', 'preparing'].includes(order.status);
              const nextStatus = getNextStatus(order.status);
              const nextStatusInfo = getStatusInfo(nextStatus);

              return (
                <div key={order.id} className="glass-card rounded-2xl overflow-hidden border border-dark-600/30 animate-fade-up"
                     style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="p-4 md:p-6 border-b border-dark-600/30 bg-dark-800/50">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 ${statusInfo.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <StatusIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-1 rounded-full text-xs md:text-sm font-semibold ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-400 text-xs md:text-sm flex-wrap">
                            <span className="flex items-center gap-1">
                              <CalendarDays className="w-3 h-3" />
                              {order.targetDate}
                            </span>
                            <span className="text-gray-500 hidden md:inline">•</span>
                            <span className="text-gray-500 text-xs">{new Date(order.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {canProgress && (
                          <button
                            onClick={() => updateOrderStatus(order.id, nextStatus)}
                            className="px-4 py-2 gradient-bg text-white rounded-lg font-semibold text-sm shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-[1.02] transition-all duration-300 flex items-center gap-1"
                          >
                            下一步：{nextStatusInfo.label}
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteConfirmOrderId(order.id)}
                          className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">删除</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 md:p-6">
                    <h3 className="text-sm md:text-lg font-semibold text-gray-300 mb-3">订单菜品</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {orderDishes.map((item) => (
                        <div key={item.id} className="flex gap-2 p-3 bg-dark-700/50 rounded-xl border border-dark-600/30">
                          <img
                            src={item.dish?.imageUrl}
                            alt={item.dish?.name}
                            className="w-12 h-12 md:w-14 md:h-14 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 flex flex-col justify-center min-w-0">
                            <span className="font-medium text-white text-sm truncate">{item.dish?.name}</span>
                            <span className="text-primary-400 text-xs font-semibold">×{item.quantity}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 删除确认弹窗 */}
        {deleteConfirmOrderId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card rounded-2xl p-6 w-full max-w-sm border border-dark-600/30">
              <div className="text-center">
                <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-7 h-7 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">确认删除</h3>
                <p className="text-gray-400 mb-6">删除后无法恢复，确定要删除此订单吗？</p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirmOrderId(null)}
                    className="flex-1 py-3 bg-dark-600 text-gray-300 rounded-xl font-semibold hover:bg-dark-500 transition-all"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => {
                      deleteOrder(deleteConfirmOrderId);
                      setDeleteConfirmOrderId(null);
                    }}
                    className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all"
                  >
                    确认删除
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
