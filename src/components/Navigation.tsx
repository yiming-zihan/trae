import { Home, ShoppingCart, ClipboardList, History, Settings, User, ChefHat, Snowflake, Smartphone, Monitor } from 'lucide-react';
import { useMenuStore } from '@/store/menuStore';
import { useState, useEffect } from 'react';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const { cart, currentUser, users, setCurrentUser } = useMenuStore();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  const [viewMode, setViewMode] = useState<'auto' | 'mobile' | 'desktop'>('auto');
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const checkViewMode = () => {
      if (viewMode === 'auto') {
        setIsMobileView(window.innerWidth < 768);
      } else {
        setIsMobileView(viewMode === 'mobile');
      }
    };

    checkViewMode();
    window.addEventListener('resize', checkViewMode);
    return () => window.removeEventListener('resize', checkViewMode);
  }, [viewMode]);

  const switchToMobileMode = () => {
    setViewMode('mobile');
  };

  const switchToDesktopMode = () => {
    setViewMode('desktop');
  };

  const resetToAutoMode = () => {
    setViewMode('auto');
  };

  const navItems = [
    { id: 'home', label: '首页', icon: Home },
    { id: 'order', label: '点菜', icon: ShoppingCart },
    { id: 'fridge', label: '冰箱', icon: Snowflake },
    { id: 'inventory', label: '清单', icon: ClipboardList },
    { id: 'history', label: '历史', icon: History },
    { id: 'settings', label: '设置', icon: Settings },
  ];

  return (
    <nav className="glass fixed top-0 left-0 right-0 z-50 border-b border-dark-600/50">
      <div className={`max-w-7xl mx-auto px-3 md:px-4 ${isMobileView ? 'max-w-md' : ''}`}>
        <div className="flex items-center justify-between h-14 md:h-16">
          <div className="flex items-center gap-2 md:gap-3 cursor-pointer" onClick={() => onPageChange('home')}>
            <div className="relative w-8 h-8 md:w-10 md:h-10">
              <div className="absolute inset-0 gradient-bg rounded-xl animate-pulse opacity-50"></div>
              <div className="relative w-full h-full gradient-bg rounded-xl flex items-center justify-center shadow-lg">
                <ChefHat className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
            </div>
            <span className="text-lg md:text-xl font-bold gradient-text">梓涵小厨</span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`relative flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-xl transition-all duration-300 group ${
                    isActive
                      ? 'bg-primary-500/20 text-primary-400 shadow-lg shadow-primary-500/10'
                      : 'text-gray-400 hover:text-white hover:bg-dark-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-sm md:text-base font-medium">{item.label}</span>
                  {item.id === 'order' && cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg">
                      {cartCount}
                    </span>
                  )}
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 md:w-8 h-0.5 bg-gradient-to-r from-transparent via-primary-500 to-transparent"></div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-dark-700/50 rounded-lg p-1">
              <button
                onClick={switchToMobileMode}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'mobile' 
                    ? 'bg-primary-500/30 text-primary-400' 
                    : 'text-gray-400 hover:text-white hover:bg-dark-600/50'
                }`}
                title="切换到手机模式"
              >
                <Smartphone className="w-4 h-4" />
              </button>
              <button
                onClick={switchToDesktopMode}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'desktop' 
                    ? 'bg-primary-500/30 text-primary-400' 
                    : 'text-gray-400 hover:text-white hover:bg-dark-600/50'
                }`}
                title="切换到电脑模式"
              >
                <Monitor className="w-4 h-4" />
              </button>
              {viewMode !== 'auto' && (
                <button
                  onClick={resetToAutoMode}
                  className="p-1 rounded-md text-gray-500 hover:text-gray-300 hover:bg-dark-600/50 transition-all"
                  title="恢复自动模式"
                >
                  <span className="text-xs">×</span>
                </button>
              )}
            </div>
            
            <select
              value={currentUser?.id || ''}
              onChange={(e) => {
                const user = users.find((u) => u.id === e.target.value);
                if (user) setCurrentUser(user);
              }}
              className="px-2 md:px-3 py-1.5 md:py-2 bg-dark-700 border border-dark-600 rounded-lg md:rounded-xl text-white text-xs md:text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all cursor-pointer"
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            <div className="relative">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-secondary-500 rounded-full border-2 border-dark-800"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden flex justify-around py-2 bg-dark-800/80 backdrop-blur-xl border-t border-dark-600/30">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-300 ${
                isActive ? 'text-primary-400' : 'text-gray-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
              {item.id === 'order' && cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-lg">
                  {cartCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
