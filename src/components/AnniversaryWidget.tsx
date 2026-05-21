import { Heart, Calendar, Gift, Sparkles, Star, HeartPulse } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Anniversary {
  id: string;
  name: string;
  date: string;
  type: 'countdown' | 'countup';
  icon: React.ReactNode;
  color: string;
}

export function AnniversaryWidget() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const anniversaries: Anniversary[] = [
    {
      id: 'wedding',
      name: '结婚纪念日',
      date: '2025-05-21',
      type: 'countdown',
      icon: <HeartPulse className="w-5 h-5 md:w-6 md:h-6" />,
      color: 'from-pink-500 to-rose-600',
    },
    {
      id: 'wife-birthday',
      name: '梓涵生日',
      date: '1999-04-26',
      type: 'countdown',
      icon: <Gift className="w-5 h-5 md:w-6 md:h-6" />,
      color: 'from-purple-500 to-pink-600',
    },
    {
      id: 'husband-birthday',
      name: '一鸣生日',
      date: '1996-08-17',
      type: 'countdown',
      icon: <Gift className="w-5 h-5 md:w-6 md:h-6" />,
      color: 'from-blue-500 to-cyan-600',
    },
    {
      id: 'together',
      name: '在一起',
      date: '2024-07-02',
      type: 'countup',
      icon: <Heart className="w-5 h-5 md:w-6 md:h-6" />,
      color: 'from-red-500 to-pink-600',
    },
  ];

  const getCountdownDays = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const nextDate = new Date(now.getFullYear(), month - 1, day);
    
    if (nextDate < now) {
      return 0;
    }
    
    const diff = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
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

  return (
    <div className="glass-card rounded-2xl md:rounded-3xl p-4 md:p-6 mb-6 md:mb-8 border border-dark-600/30 animate-fade-up">
      <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
        <div className="w-10 h-10 md:w-12 md:h-12 gradient-bg rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
          <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
        <div>
          <h2 className="text-lg md:text-2xl font-bold text-white">重要的日子</h2>
          <p className="text-xs md:text-sm text-gray-400">记录我们的美好时刻</p>
        </div>
      </div>

      {/* 紧凑的卡片布局 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        {anniversaries.map((anniversary, index) => (
          <div
            key={anniversary.id}
            className="relative overflow-hidden rounded-xl md:rounded-2xl p-3 md:p-4 md:p-6 bg-dark-700/50 border border-dark-600/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl animate-fade-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className={`absolute top-0 left-0 w-full h-0.5 md:h-1 bg-gradient-to-r ${anniversary.color}`}></div>
            
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br ${anniversary.color} flex items-center justify-center mb-2 md:mb-4 shadow-lg`}>
              <div className="text-white">{anniversary.icon}</div>
            </div>
            
            <h3 className="text-sm md:text-lg font-semibold text-white mb-1 md:mb-2 truncate">{anniversary.name}</h3>
            
            <div className="flex items-end gap-1 md:gap-2 mb-1 md:mb-2">
              <span className={`text-2xl md:text-4xl font-bold bg-gradient-to-r ${anniversary.color} bg-clip-text text-transparent`}>
                {anniversary.type === 'countdown'
                  ? (getCountdownDays(anniversary.date) === 0 ? '当天' : getCountdownDays(anniversary.date))
                  : getCountupDays(anniversary.date)}
              </span>
              {anniversary.type === 'countdown' && getCountdownDays(anniversary.date) !== 0 && (
                <span className="text-xs md:text-sm text-gray-400 mb-0.5">天</span>
              )}
              {anniversary.type === 'countup' && (
                <span className="text-xs md:text-sm text-gray-400 mb-0.5">天</span>
              )}
            </div>
            
            <p className="text-xs md:text-sm text-gray-400">
              {anniversary.type === 'countdown' ? (
                <>
                  {formatDate(anniversary.date)}
                  {getCountdownDays(anniversary.date) === 0 && (
                    <span className="ml-1 text-primary-400 font-semibold animate-pulse">🎂</span>
                  )}
                </>
              ) : (
                <>从 {formatDate(anniversary.date)} 开始</>
              )}
            </p>

            <div className="absolute top-2 md:top-3 right-2 md:right-3">
              <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 opacity-50" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
