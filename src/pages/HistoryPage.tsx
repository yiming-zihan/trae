import { History, Check, Clock, AlertCircle, ChefHat, CalendarDays } from 'lucide-react';
import { useMenuStore } from '@/store/menuStore';

export function HistoryPage() {
  const { orders, dishes, updateOrderStatus } = useMenuStore();
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
        <div className="text-center mb-12 animate-fade-up">
          <div className="w-20 h-20 mx-auto bg-dark-700/50 rounded-2xl flex items-center justify-center mb-6 border border-dark-600/30">
            <History className="w-10 h-10 text-primary-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">订单历史</h1>
          <p className="text-gray-400 text-lg">查看所有的美食记录</p>
        </div>

        {sortedOrders.length === 0 ? (
          <div className="glass-card rounded-3xl p-16 text-center border border-dark-600/30 animate-fade-up">
            <div className="w-24 h-24 bg-dark-700/50 rounded-full flex items-center justify-center mx-auto mb-8">
              <CalendarDays className="w-12 h-12 text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">还没有订单记录</h3>
            <p className="text-gray-400">快去首页开始第一单吧~</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedOrders.map((order, index) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;
              const orderDishes = getOrderDishes(order.id);
              const canProgress = ['pending', 'accepted', 'preparing'].includes(order.status);
              const nextStatus = getNextStatus(order.status);
              const nextStatusInfo = getStatusInfo(nextStatus);

              return (
                <div key={order.id} className="glass-card rounded-3xl overflow-hidden border border-dark-600/30 animate-fade-up"
                     style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="p-8 border-b border-dark-600/30 bg-dark-800/50">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 ${statusInfo.color} rounded-2xl flex items-center justify-center`}>
                          <StatusIcon className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-gray-400 text-sm">
                            <span className="flex items-center gap-1">
                              <CalendarDays className="w-4 h-4" />
                              {order.targetDate}
                            </span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-500">{new Date(order.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      {canProgress && (
                        <button
                          onClick={() => updateOrderStatus(order.id, nextStatus)}
                          className="px-6 py-3 gradient-bg text-white rounded-xl font-semibold shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-[1.02] transition-all duration-300 flex items-center gap-2"
                        >
                          下一步：{nextStatusInfo.label}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-8">
                    <h3 className="text-lg font-semibold text-gray-300 mb-4">订单菜品</h3>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {orderDishes.map((item) => (
                        <div key={item.id} className="flex gap-3 p-4 bg-dark-700/50 rounded-xl border border-dark-600/30">
                          <img
                            src={item.dish?.imageUrl}
                            alt={item.dish?.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1 flex flex-col justify-center">
                            <span className="font-medium text-white">{item.dish?.name}</span>
                            <span className="text-primary-400 text-sm font-semibold">×{item.quantity}</span>
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
      </div>
    </div>
  );
}
