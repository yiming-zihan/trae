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
      name: '我们的结婚纪念日',
      date: '2025-05-21',
      type: 'countdown',
      icon: <HeartPulse className="w-6 h-6" />,
      color: 'from-pink-500 to-rose-600',
    },
    {
      id: 'wife-birthday',
      name: '赵梓涵的生日',
      date: '1999-04-26',
      type: 'countdown',
      icon: <Gift className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-600',
    },
    {
      id: 'husband-birthday',
      name: '谢一鸣的生日',
      date: '1996-08-17',
      type: 'countdown',
      icon: <Gift className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-600',
    },
    {
      id: 'together',
      name: '我们在一起的天数',
      date: '2024-07-02',
      type: 'countup',
      icon: <Heart className="w-6 h-6" />,
      color: 'from-red-500 to-pink-600',
    },
  ];

  const getCountdownDays = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const nextDate = new Date(now.getFullYear(), month - 1, day);
    
    if (nextDate < now) {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
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
    return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
  };

  return (
    <div className="glass-card rounded-3xl p-8 mb-8 border border-dark-600/30 animate-fade-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">重要的日子</h2>
          <p className="text-gray-400">记录我们的美好时刻</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {anniversaries.map((anniversary, index) => (
          <div
            key={anniversary.id}
            className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br border border-dark-600/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl animate-fade-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${anniversary.color}`}></div>
            
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${anniversary.color} flex items-center justify-center mb-4 shadow-lg`}>
              <div className="text-white">{anniversary.icon}</div>
            </div>
            
            <h3 className="text-lg font-semibold text-white mb-2">{anniversary.name}</h3>
            
            <div className="flex items-end gap-2 mb-2">
              <span className={`text-4xl font-bold bg-gradient-to-r ${anniversary.color} bg-clip-text text-transparent`}>
                {anniversary.type === 'countdown'
                  ? getCountdownDays(anniversary.date)
                  : getCountupDays(anniversary.date)}
              </span>
              <span className="text-gray-400 mb-1">天</span>
            </div>
            
            <p className="text-sm text-gray-400">
              {anniversary.type === 'countdown' ? (
                <>
                  {formatDate(anniversary.date)}
                  {getCountdownDays(anniversary.date) === 0 && (
                    <span className="ml-1 text-primary-400 font-semibold animate-pulse">🎂 就是今天！</span>
                  )}
                </>
              ) : (
                <>从 {anniversary.date} 开始</>
              )}
            </p>

            <div className="absolute top-3 right-3">
              <Star className="w-4 h-4 text-yellow-400 opacity-50" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
