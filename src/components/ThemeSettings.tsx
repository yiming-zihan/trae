import { Check, X } from 'lucide-react';
import { themes, getCurrentTheme, setTheme, ThemeName } from '@/utils/theme';

export function ThemeSettings() {
  const currentTheme = getCurrentTheme();

  const handleThemeChange = (themeId: ThemeName) => {
    setTheme(themeId);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-pattern pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => window.history.back()}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回设置
        </button>

        <div className="glass-card rounded-3xl p-8 border border-dark-600/30">
          <h2 className="text-3xl font-bold text-white mb-2">主题设置</h2>
          <p className="text-gray-400 mb-8">选择您喜欢的主题外观</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.values(themes).map((theme) => {
              const isActive = currentTheme === theme.id;
              
              return (
                <div
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                    isActive ? 'ring-4 ring-primary-500 shadow-lg shadow-primary-500/30' : 'ring-1 ring-dark-600'
                  }`}
                >
                  <div className={`h-32 ${theme.preview} relative`}>
                    <div className="absolute inset-0 flex items-center justify-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-xl"
                        style={{ backgroundColor: theme.colors.primary }}
                      />
                      <div 
                        className="w-12 h-12 rounded-xl"
                        style={{ backgroundColor: theme.colors.secondary }}
                      />
                      <div 
                        className="w-12 h-12 rounded-xl"
                        style={{ backgroundColor: theme.colors.surface }}
                      />
                    </div>
                    
                    {isActive && (
                      <div className="absolute top-3 right-3 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center shadow-lg">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5 bg-dark-800">
                    <h3 className="text-xl font-bold mb-2" style={{ color: theme.colors.text }}>
                      {theme.name}
                    </h3>
                    <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                      {theme.description}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: theme.colors.primary }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: theme.colors.secondary }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: theme.colors.surface, border: '2px solid rgba(255,255,255,0.2)' }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-6 bg-dark-700/50 rounded-2xl border border-dark-600/30">
            <h3 className="text-lg font-semibold text-white mb-3">当前主题</h3>
            <p className="text-gray-400">
              您正在使用 <span className="text-primary-400 font-semibold">{themes[currentTheme].name}</span> 主题
            </p>
            <p className="text-gray-500 text-sm mt-2">
              点击上方主题卡片即可切换，所有设置会自动保存
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
