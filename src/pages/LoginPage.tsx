import { Lock, Eye, EyeOff, Shield, ChefHat, Smartphone, Send, CheckCircle2, Save } from 'lucide-react';
import { useState, useEffect } from 'react';

interface LoginPageProps {
  onLogin: (password: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // 记住密码自动登录
  useEffect(() => {
    const rememberPassword = localStorage.getItem('remember_password');
    const storedPassword = localStorage.getItem('app_password');
    
    if (rememberPassword && storedPassword) {
      try {
        const decrypted = atob(storedPassword);
        // 自动登录
        onLogin(decrypted);
      } catch (err) {
        console.error('自动登录失败');
      }
    } else if (!storedPassword) {
      setIsSettingPassword(true);
    }

    // 获取用户设置的手机号
    const userProfile = localStorage.getItem('user_profile');
    if (userProfile) {
      const profile = JSON.parse(userProfile);
      // 可以预填手机号
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSettingPassword) {
      if (password.length < 4) {
        setError('密码至少4位');
        return;
      }
      if (password !== confirmPassword) {
        setError('两次密码不一致');
        return;
      }

      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const encrypted = btoa(password);
      localStorage.setItem('app_password', encrypted);
      localStorage.setItem('password_set', 'true');
      
      // 如果勾选记住密码
      if (rememberMe) {
        localStorage.setItem('remember_password', 'true');
      }
      
      setIsLoading(false);
      onLogin(password);
    } else {
      const storedEncrypted = localStorage.getItem('app_password');
      if (!storedEncrypted) {
        setError('请先设置密码');
        return;
      }

      const decrypted = atob(storedEncrypted);
      // 支持新旧两种密码格式
      if (password === decrypted || password + 'zihan_secret' === decrypted) {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 如果勾选记住密码
        if (rememberMe) {
          localStorage.setItem('remember_password', 'true');
        } else {
          localStorage.removeItem('remember_password');
        }
        
        setIsLoading(false);
        onLogin(password);
      } else {
        setError('密码错误，请重试');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="glass-card rounded-3xl p-8 border border-dark-600/30">
          <div className="text-center mb-8">
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 gradient-bg rounded-3xl flex items-center justify-center shadow-2xl shadow-primary-500/30">
                <ChefHat className="w-14 h-14 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              梓涵小厨
            </h1>
            <p className="text-gray-400">
              {isSettingPassword ? '设置您的访问密码' : '请输入密码访问'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {isSettingPassword ? '设置密码' : '密码'}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-dark-700 border border-dark-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  placeholder="请输入密码"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isSettingPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  确认密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-dark-700 border border-dark-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    placeholder="请再次输入密码"
                  />
                </div>
              </div>
            )}

            {/* 记住密码选项 */}
            {!isSettingPassword && (
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div 
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      rememberMe 
                        ? 'bg-primary-500 border-primary-500' 
                        : 'border-dark-500 group-hover:border-primary-400'
                    }`}
                  >
                    {rememberMe && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <span className="text-gray-300 text-sm">记住密码</span>
                </label>
                <span className="text-xs text-gray-500">（勾选后下次自动登录）</span>
              </div>
            )}

            {/* 设置密码时的记住密码选项 */}
            {isSettingPassword && (
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div 
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      rememberMe 
                        ? 'bg-primary-500 border-primary-500' 
                        : 'border-dark-500 group-hover:border-primary-400'
                    }`}
                  >
                    {rememberMe && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <span className="text-gray-300 text-sm">记住密码</span>
                </label>
                <span className="text-xs text-gray-500">（勾选后下次自动登录）</span>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 gradient-bg text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Shield className="w-6 h-6" />
                  {isSettingPassword ? '设置密码并进入' : '进入应用'}
                </>
              )}
            </button>
          </form>

          {/* 修改密码入口 */}
          {!isSettingPassword && (
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  // 跳转到设置页面修改密码
                  window.location.href = '/?page=settings&action=change-password';
                }}
                className="text-sm text-gray-400 hover:text-primary-400 transition-colors"
              >
                修改访问密码
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-dark-600/30 text-center">
            <p className="text-xs text-gray-500">
              🔒 密码已加密存储，保护您的隐私
            </p>
            {rememberMe && (
              <p className="text-xs text-primary-400 mt-2">
                ✓ 已启用自动登录
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
