import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { CartDrawer } from '@/components/CartDrawer';
import { HomePage } from '@/pages/HomePage';
import { OrderPage } from '@/pages/OrderPage';
import { FridgePage } from '@/pages/FridgePage';
import { InventoryPage } from '@/pages/InventoryPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { LoginPage } from '@/pages/LoginPage';
import { applyTheme, getCurrentTheme } from '@/utils/theme';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化主题
  useEffect(() => {
    const theme = getCurrentTheme();
    applyTheme(theme);
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      const passwordSet = localStorage.getItem('password_set');
      const currentPassword = sessionStorage.getItem('current_password');
      
      // 如果没有设置密码，或者设置了密码但当前会话没有登录，则显示登录页面
      if (!passwordSet || !currentPassword) {
        setIsAuthenticated(false);
      } else {
        // 已登录，显示主应用
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  // 处理URL参数
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    const action = params.get('action');
    
    if (page === 'settings' && action === 'change-password') {
      setCurrentPage('settings');
      // 清除URL参数
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleLogin = (password: string) => {
    sessionStorage.setItem('current_password', password);
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onOpenCart={() => setIsCartOpen(true)} onNavigateToPage={setCurrentPage} />;
      case 'order':
        return <OrderPage />;
      case 'fridge':
        return <FridgePage />;
      case 'inventory':
        return <InventoryPage onNavigateToPage={setCurrentPage} />;
      case 'history':
        return <HistoryPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage onOpenCart={() => setIsCartOpen(true)} onNavigateToPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="pt-24 md:pt-16 pb-20 md:pb-6">
        {renderPage()}
      </main>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}

export default App;
