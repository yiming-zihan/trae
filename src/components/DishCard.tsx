import { Plus, Check, Heart } from 'lucide-react';
import { Dish } from '@/types';
import { useMenuStore } from '@/store/menuStore';
import { useState } from 'react';

interface DishCardProps {
  dish: Dish;
  showAddButton?: boolean;
  index: number;
}

export function DishCard({ dish, showAddButton = true, index }: DishCardProps) {
  const { cart, addToCart } = useMenuStore();
  const isInCart = cart.some((item) => item.dish.id === dish.id);
  const [isLiked, setIsLiked] = useState(false);

  const categoryColors: Record<string, string> = {
    '家常菜': 'from-blue-500 to-cyan-500',
    '川菜': 'from-red-500 to-orange-500',
    '粤菜': 'from-green-500 to-emerald-500',
    '凉菜': 'from-cyan-500 to-teal-500',
    '特色菜': 'from-purple-500 to-pink-500',
    '时蔬': 'from-green-400 to-lime-400',
    '蒸菜': 'from-yellow-500 to-amber-500',
    '火锅': 'from-red-600 to-rose-600',
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden group animate-fade-up card-hover"
         style={{ animationDelay: `${index * 50}ms` }}>
      <div className="relative h-48 overflow-hidden">
        <img
          src={dish.imageUrl}
          alt={dish.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/20 to-transparent"></div>
        
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${categoryColors[dish.category] || 'from-gray-500 to-gray-600'} shadow-lg`}>
            {dish.category}
          </span>
        </div>
        
        <button
          onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}
          className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md ${
            isLiked ? 'bg-rose-500/80 text-white shadow-lg shadow-rose-500/30' : 'bg-white/20 text-white hover:bg-white/40'
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        {showAddButton && (
          <button
            onClick={() => addToCart(dish)}
            className={`absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
              isInCart
                ? 'bg-secondary-500 text-white scale-110 glow-effect'
                : 'gradient-bg text-white hover:scale-110 hover:shadow-primary-500/40'
            }`}
          >
            {isInCart ? <Check className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
          </button>
        )}
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
          {dish.name}
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed">{dish.description}</p>
      </div>
    </div>
  );
}
