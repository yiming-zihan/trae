import { Sparkles, ShoppingCart, ChefHat, Snowflake, ClipboardList, History, Settings, ArrowRight } from 'lucide-react';
import { useMenuStore } from '@/store/menuStore';
import { AnniversaryWidget } from '@/components/AnniversaryWidget';

interface HomePageProps {
  onOpenCart: () => void;
  onNavigateToPage: (page: string) => void;
}

export function HomePage({ onOpenCart, onNavigateToPage }: HomePageProps) {
  const { cart, currentUser, orders, fridgeItems, ingredients } = useMenuStore();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const pendingOrders = orders.filter((order) => order.status === 'pending');
  const expiringItems = fridgeItems.filter((item) => {
    if (!item.expiryDate) return false;
    const expiry = new Date(item.expiryDate);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    return days <= 3;
  });
  const lowStockIngredients = ingredients.filter((ing) => ing.inStock < ing.quantity * 0.4);

  const quickActions = [
    { 
      id: 'order', 
      label: '去点菜', 
      icon: ShoppingCart, 
      description: '选择今天想吃的菜品', 
      color: 'from-primary-500 to-orange-600',
      count: cartCount > 0 ? cartCount : null,
    },
    { 
      id: 'fridge', 
      label: '冰箱储备', 
      icon: Snowflake, 
      description: '管理冰箱里的食材', 
      color: 'from-blue-500 to-cyan-600',
      count: fridgeItems.length,
    },
    { 
      id: 'inventory', 
      label: '食材清单', 
      icon: ClipboardList, 
      description: '查看需要采购的食材', 
      color: 'from-secondary-500 to-emerald-600',
      count: lowStockIngredients.length,
    },
    { 
      id: 'history', 
      label: '历史订单', 
      icon: History, 
      description: '查看之前的点餐记录', 
      color: 'from-purple-500 to-pink-600',
      count: orders.length,
    },
    { 
      id: 'settings', 
      label: '设置', 
      icon: Settings, 
      description: '管理账户和设置', 
      color: 'from-gray-500 to-gray-700',
      count: null,
    },
  ];

  return (
    <div className="min-h-screen bg-pattern">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 via-transparent to-secondary-600/10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 pt-32 pb-16">
          <div className="text-center max-w-3xl mx-auto animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-700/50 border border-dark-600/50 mb-6">
              <Sparkles className="w-4 h-4 text-primary-400" />
              <span className="text-sm text-gray-300">欢迎来到梓涵小厨</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-shadow">
              <span className="gradient-text">
                {currentUser?.role === 'wife' ? '亲爱的梓涵' : '一鸣准备好了'}
              </span>
              <br />
              <span className="text-white">今天也要好好吃饭~</span>
            </h1>
            <p className="text-xl text-gray-300 mb-10">
              {currentUser?.role === 'wife' ? '选择美食，享受幸福每一天' : '为梓涵准备美味的晚餐'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        <AnniversaryWidget />

        {(pendingOrders.length > 0 || expiringItems.length > 0 || lowStockIngredients.length > 0) && (
          <div className="grid md:grid-cols-3 gap-6 mb-12 animate-fade-up animate-delay-200">
            {pendingOrders.length > 0 && (
              <div className="glass-card rounded-2xl p-6 border border-yellow-500/30 bg-yellow-500/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <ChefHat className="w-5 h-5 text-yellow-400" />
                  </div>
                  <h3 className="font-bold text-yellow-400">待处理订单</h3>
                </div>
                <p className="text-3xl font-bold text-white mb-2">{pendingOrders.length}</p>
                <p className="text-gray-400 text-sm">还有订单需要处理</p>
              </div>
            )}
            
            {expiringItems.length > 0 && (
              <div className="glass-card rounded-2xl p-6 border border-orange-500/30 bg-orange-500/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <Snowflake className="w-5 h-5 text-orange-400" />
                  </div>
                  <h3 className="font-bold text-orange-400">即将过期</h3>
                </div>
                <p className="text-3xl font-bold text-white mb-2">{expiringItems.length}</p>
                <p className="text-gray-400 text-sm">食材需要尽快处理</p>
              </div>
            )}
            
            {lowStockIngredients.length > 0 && (
              <div className="glass-card rounded-2xl p-6 border border-primary-500/30 bg-primary-500/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-primary-400" />
                  </div>
                  <h3 className="font-bold text-primary-400">需要采购</h3>
                </div>
                <p className="text-3xl font-bold text-white mb-2">{lowStockIngredients.length}</p>
                <p className="text-gray-400 text-sm">食材库存不足</p>
              </div>
            )}
          </div>
        )}

        <h2 className="text-2xl font-bold text-white mb-6 animate-fade-up animate-delay-300">快捷操作</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => {
                  onNavigateToPage(action.id);
                }}
                className="glass-card rounded-2xl p-6 border border-dark-600/30 hover:border-primary-500/50 transition-all group text-left animate-fade-up"
                style={{ animationDelay: `${(index + 3) * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${action.color} rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  {action.count !== null && action.count > 0 && (
                    <span className="px-3 py-1 bg-primary-500 text-white text-sm font-bold rounded-full animate-pulse">
                      {action.count}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                  {action.label}
                </h3>
                <p className="text-gray-400 mb-4">{action.description}</p>
                <div className="flex items-center gap-2 text-primary-400 font-medium opacity-0 group-hover:opacity-100 transition-all">
                  <span>立即前往</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>

        <div className="glass-card rounded-2xl p-8 border border-dark-600/30 animate-fade-up animate-delay-600">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <ChefHat className="w-6 h-6 text-primary-400" />
            今日寄语
          </h2>
          <div className="text-center py-8">
            <p className="text-2xl font-bold gradient-text mb-4">
              "好好吃饭，是最好的生活仪式感"
            </p>
            <p className="text-gray-400">
              每一餐都是对生活的热爱，每一道菜都是对家人的关爱
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
