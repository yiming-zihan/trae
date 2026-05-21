import { Heart, Calendar, Gift, Sparkles, Star, HeartPulse, Flower2, PartyPopper } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Anniversary {
  id: string;
  name: string;
  date: string;
  type: 'countdown' | 'countup';
  icon: React.ReactNode;
  color: string;
  todayEmoji: string;
}

export function AnniversaryWidget() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 检查今天是否是特殊日子
  const isTodaySpecialDay = () => {
    return anniversaries.some(a => a.type === 'countdown' && getCountdownDays(a.date) === 0);
  };

  const anniversaries: Anniversary[] = [
    {
      id: 'wedding',
      name: '结婚纪念日',
      date: '2025-05-21',
      type: 'countdown',
      icon: <Flower2 className="w-5 h-5 md:w-6 md:h-6" />,
      color: 'from-rose-400 to-pink-600',
      todayEmoji: '💍',
    },
    {
      id: 'wife-birthday',
      name: '梓涵生日',
      date: '1999-04-26',
      type: 'countdown',
      icon: <Gift className="w-5 h-5 md:w-6 md:h-6" />,
      color: 'from-purple-500 to-pink-600',
      todayEmoji: '🎁',
    },
    {
      id: 'husband-birthday',
      name: '一鸣生日',
      date: '1996-08-17',
      type: 'countdown',
      icon: <Gift className="w-5 h-5 md:w-6 md:h-6" />,
      color: 'from-blue-500 to-cyan-600',
      todayEmoji: '🎂',
    },
    {
      id: 'together',
      name: '在一起',
      date: '2024-07-02',
      type: 'countup',
      icon: <Heart className="w-5 h-5 md:w-6 md:h-6" />,
      color: 'from-red-500 to-pink-600',
      todayEmoji: '❤️',
    },
  ];

  const getCountdownDays = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisYearDate = new Date(now.getFullYear(), month - 1, day);
    
    if (today.getTime() === thisYearDate.getTime()) {
      return 0;
    }
    
    let targetDate = thisYearDate;
    if (thisYearDate < today) {
      targetDate = new Date(now.getFullYear() + 1, month - 1, day);
    }
    
    const diff = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getCountupDays = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const startDate = new Date(year, month - 1, day);
    const diff = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const todayIsSpecial = isTodaySpecialDay();

  return (
    <div className={`relative overflow-hidden glass-card rounded-2xl md:rounded-3xl p-4 md:p-6 mb-6 md:mb-8 border transition-all duration-500 ${
      todayIsSpecial 
        ? 'border-rose-400/50 shadow-xl shadow-rose-500/20 bg-gradient-to-br from-rose-500/5 via-dark-800/90 to-pink-500/5' 
        : 'border-dark-600/30'
    } animate-fade-up`}>
      
      {/* 特殊日子背景装饰 */}
      {todayIsSpecial && (
        <>
          {/* 浮动的大花瓣 */}
          <div className="absolute top-0 left-1/4 text-4xl md:text-6xl text-rose-300/20 animate-float-lg">🌸</div>
          <div className="absolute top-1/4 right-0 text-3xl md:text-5xl text-pink-300/20 animate-float-lg-delay">🌺</div>
          <div className="absolute bottom-1/4 left-0 text-3xl md:text-5xl text-red-300/20 animate-float-lg-slow">🌹</div>
          <div className="absolute bottom-0 right-1/4 text-4xl md:text-6xl text-rose-400/20 animate-float-lg-delay-slow">🌷</div>
          {/* 小装饰 */}
          <div className="absolute top-8 left-8 text-xl text-yellow-400/30 animate-spin-slow">✨</div>
          <div className="absolute top-12 right-12 text-xl text-pink-400/30 animate-spin-slow-delay">⭐</div>
          <div className="absolute bottom-16 left-16 text-xl text-rose-400/30 animate-spin-slow">💫</div>
          <div className="absolute bottom-12 right-8 text-xl text-purple-400/30 animate-spin-slow-delay">🌟</div>
        </>
      )}

      <div className="relative z-10">
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${
            todayIsSpecial 
              ? 'bg-gradient-to-br from-rose-400 to-pink-600 shadow-rose-500/40 animate-glow' 
              : 'gradient-bg shadow-primary-500/30'
          }`}>
            {todayIsSpecial ? (
              <PartyPopper className="w-5 h-5 md:w-6 md:h-6 text-white animate-bounce-slow" />
            ) : (
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
            )}
          </div>
          <div>
            <h2 className="text-lg md:text-2xl font-bold text-white flex items-center gap-2">
              {todayIsSpecial && <span className="animate-bounce">🎉</span>}
              重要的日子
            </h2>
            <p className={`text-xs md:text-sm ${todayIsSpecial ? 'text-rose-400' : 'text-gray-400'}`}>
              {todayIsSpecial ? '今天有特别的惊喜！' : '记录我们的美好时刻'}
            </p>
          </div>
        </div>

        {/* 卡片布局 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          {anniversaries.map((anniversary, index) => {
            const isToday = anniversary.type === 'countdown' && getCountdownDays(anniversary.date) === 0;
            
            return (
              <div
                key={anniversary.id}
                className={`relative overflow-hidden rounded-xl md:rounded-2xl p-3 md:p-4 md:p-6 transition-all duration-500 animate-fade-up ${
                  isToday 
                    ? 'bg-gradient-to-br from-rose-500/20 via-dark-700/80 to-pink-500/20 border-2 border-rose-400/60 shadow-2xl shadow-rose-500/30 scale-[1.02]' 
                    : 'bg-dark-700/50 border border-dark-600/30 hover:scale-[1.02] hover:shadow-xl'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`absolute top-0 left-0 w-full h-1 md:h-1.5 bg-gradient-to-r ${anniversary.color}`}></div>
                
                {/* 当天的华丽装饰 */}
                {isToday && (
                  <>
                    {/* 发光边框 */}
                    <div className={`absolute inset-0 rounded-xl md:rounded-2xl bg-gradient-to-br ${anniversary.color} opacity-10 blur-xl animate-pulse-slow`}></div>
                    {/* 大花瓣装饰 */}
                    <div className="absolute -top-2 -left-2 text-2xl md:text-3xl animate-float">🌸</div>
                    <div className="absolute -top-2 -right-2 text-2xl md:text-3xl animate-float-delay">🌺</div>
                    <div className="absolute -bottom-1 -left-1 text-xl md:text-2xl animate-float-slow">🌹</div>
                    <div className="absolute -bottom-1 -right-1 text-xl md:text-2xl animate-float-delay-slow">🌷</div>
                    {/* 小星星 */}
                    <div className="absolute top-3 right-4 text-yellow-400/60 text-xs animate-pulse">✨</div>
                    <div className="absolute bottom-8 left-3 text-pink-400/60 text-xs animate-pulse-delay">⭐</div>
                  </>
                )}
                
                <div className={`relative w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br ${anniversary.color} flex items-center justify-center mb-2 md:mb-4 shadow-lg transition-all duration-300 ${
                  isToday ? 'shadow-2xl shadow-rose-500/50 animate-glow' : ''
                }`}>
                  <div className={`text-white transition-all duration-300 ${isToday ? 'animate-bounce-slow scale-110' : ''}`}>
                    {isToday ? <PartyPopper className="w-5 h-5 md:w-6 md:h-6" /> : anniversary.icon}
                  </div>
                </div>
                
                <h3 className={`relative text-sm md:text-lg font-semibold mb-1 md:mb-2 truncate transition-colors ${
                  isToday ? 'text-rose-300' : 'text-white'
                }`}>
                  {anniversary.name}
                  {isToday && <span className="ml-1">{anniversary.todayEmoji}</span>}
                </h3>
                
                <div className="relative flex items-end gap-1 md:gap-2 mb-1 md:mb-2">
                  <span className={`text-2xl md:text-4xl font-bold bg-gradient-to-r ${anniversary.color} bg-clip-text text-transparent`}>
                    {anniversary.type === 'countdown'
                      ? (getCountdownDays(anniversary.date) === 0 ? (
                        <span className="relative inline-block">
                          <span className="animate-bounce">今</span>
                          <span className="animate-bounce-delay">天</span>
                        </span>
                      ) : getCountdownDays(anniversary.date))
                      : getCountupDays(anniversary.date)}
                  </span>
                  {anniversary.type === 'countdown' && getCountdownDays(anniversary.date) !== 0 && (
                    <span className="text-xs md:text-sm text-gray-400 mb-0.5">天</span>
                  )}
                  {anniversary.type === 'countup' && (
                    <span className="text-xs md:text-sm text-gray-400 mb-0.5">天</span>
                  )}
                </div>
                
                <p className="relative text-xs md:text-sm text-gray-400">
                  {anniversary.type === 'countdown' ? (
                    <>
                      {formatDate(anniversary.date)}
                      {isToday && (
                        <span className="ml-1 text-rose-400 font-bold animate-pulse text-base">🎉</span>
                      )}
                    </>
                  ) : (
                    <>从 {formatDate(anniversary.date)} 开始</>
                  )}
                </p>

                <div className="absolute top-2 md:top-3 right-2 md:right-3">
                  <Star className={`w-3 h-3 md:w-4 md:h-4 transition-colors ${
                    isToday ? 'text-rose-400 opacity-80' : 'text-yellow-400 opacity-50'
                  }`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
