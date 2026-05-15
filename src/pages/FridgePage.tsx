import { useState, useEffect } from 'react';
import { 
  Snowflake, 
  Thermometer, 
  Sun, 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Calendar,
  CheckCircle,
  XCircle,
  Save,
  Search,
  RefreshCw,
  ArrowUpDown,
  PlusCircle,
  MinusCircle,
  Info
} from 'lucide-react';
import { useMenuStore } from '@/store/menuStore';
import { FridgeItem } from '@/types';

const categoryIcons = {
  '冷藏': Snowflake,
  '冷冻': Thermometer,
  '常温': Sun,
  '其他': Package,
};

const categoryColors = {
  '冷藏': 'text-blue-400 bg-blue-500/20',
  '冷冻': 'text-cyan-400 bg-cyan-500/20',
  '常温': 'text-yellow-400 bg-yellow-500/20',
  '其他': 'text-gray-400 bg-gray-500/20',
};

export function FridgePage() {
  const { 
    fridgeItems, 
    ingredients, 
    addFridgeItem, 
    updateFridgeItem, 
    removeFridgeItem, 
    syncFridgeToInventory 
  } = useMenuStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<FridgeItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'全部' | '冷藏' | '冷冻' | '常温' | '其他'>('全部');
  const [sortBy, setSortBy] = useState<'name' | 'expiry' | 'added'>('added');
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);
  const [syncCount, setSyncCount] = useState(0);

  const isExpiringSoon = (item: FridgeItem) => {
    if (!item.expiryDate) return false;
    const expiry = new Date(item.expiryDate);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    return days <= 3;
  };

  const isExpired = (item: FridgeItem) => {
    if (!item.expiryDate) return false;
    return new Date(item.expiryDate) < new Date();
  };

  const handleQuantityChange = (item: FridgeItem, newQuantity: number) => {
    if (newQuantity < 0) return;
    updateFridgeItem(item.id, { quantity: newQuantity });
  };

  const handleSyncToInventory = () => {
    syncFridgeToInventory();
    const linkedCount = fridgeItems.filter(item => item.ingredientId).length;
    setSyncCount(linkedCount);
    setShowSyncSuccess(true);
    setTimeout(() => setShowSyncSuccess(false), 3000);
  };

  const filteredItems = fridgeItems.filter((item) => {
    const matchesSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === '全部' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'expiry':
        if (!a.expiryDate && !b.expiryDate) return 0;
        if (!a.expiryDate) return 1;
        if (!b.expiryDate) return -1;
        return new Date(a.expiryDate).getTime() - new Date(a.expiryDate).getTime();
      case 'added':
        return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
      default:
        return 0;
    }
  });

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, FridgeItem[]>);

  return (
    <div className="min-h-screen bg-pattern pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-up">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">冰箱储备</h1>
            <p className="text-gray-400 text-lg">管理您的冰箱食材，关联库存清单</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSyncToInventory}
              className="flex items-center gap-2 px-4 py-3 bg-dark-700 border border-dark-600 text-white rounded-xl font-medium hover:bg-dark-600 transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              同步库存
            </button>
            <button
              onClick={() => {
                setEditingItem(null);
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 gradient-bg text-white rounded-xl font-bold shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-[1.02] transition-all"
            >
              <Plus className="w-5 h-5" />
              添加食材
            </button>
          </div>
        </div>

        {showSyncSuccess && (
          <div className="mb-6 p-4 bg-secondary-500/20 border border-secondary-500/30 rounded-xl text-secondary-400 text-center animate-fade-up">
            <CheckCircle className="w-5 h-5 inline-block mr-2" />
            已将 {syncCount} 种关联食材同步到库存！
          </div>
        )}

        {(fridgeItems.filter(item => item.ingredientId).length > 0) && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-sm flex items-start gap-2">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">食材关联说明</p>
              <p>您有 {fridgeItems.filter(item => item.ingredientId).length} 种食材已关联到库存系统。关联后，冰箱中的食材数量会自动同步到食材库存中。</p>
            </div>
          </div>
        )}

        {(isExpiringSoon.length > 0 || isExpired.length > 0) && fridgeItems.some(isExpiringSoon) && (
          <div className="space-y-4 mb-8 animate-fade-up">
            {fridgeItems.filter(isExpired).length > 0 && (
              <div className="glass-card rounded-2xl p-6 border border-red-500/30 bg-red-500/10">
                <div className="flex items-center gap-3 mb-4">
                  <XCircle className="w-7 h-7 text-red-400" />
                  <h2 className="text-xl font-bold text-red-400">已过期食材 ({fridgeItems.filter(isExpired).length})</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {fridgeItems.filter(isExpired).map((item) => (
                    <span
                      key={item.id}
                      className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full text-red-300 text-sm font-medium"
                    >
                      {item.name} - {new Date(item.expiryDate!).toLocaleDateString()}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {fridgeItems.filter(isExpiringSoon).filter(item => !isExpired(item)).length > 0 && (
              <div className="glass-card rounded-2xl p-6 border border-yellow-500/30 bg-yellow-500/10 animate-fade-up">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-7 h-7 text-yellow-400" />
                  <h2 className="text-xl font-bold text-yellow-400">即将过期 ({fridgeItems.filter(isExpiringSoon).filter(item => !isExpired(item)).length})</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {fridgeItems.filter(isExpiringSoon).filter(item => !isExpired(item)).map((item) => (
                    <span
                      key={item.id}
                      className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-300 text-sm font-medium"
                    >
                      {item.name} - {new Date(item.expiryDate!).toLocaleDateString()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="glass-card rounded-2xl p-6 mb-8 border border-dark-600/30 animate-fade-up animate-delay-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索食材..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-all"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-all"
              >
                <option value="全部">全部分类</option>
                <option value="冷藏">冷藏</option>
                <option value="冷冻">冷冻</option>
                <option value="常温">常温</option>
                <option value="其他">其他</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-all"
              >
                <option value="added">按添加时间</option>
                <option value="name">按名称</option>
                <option value="expiry">按过期时间</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {Object.entries(groupedItems).map(([category, items], index) => {
            const Icon = categoryIcons[category as keyof typeof categoryIcons];
            const colorClass = categoryColors[category as keyof typeof categoryColors];
            
            return (
              <div key={category} className="animate-fade-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">{category}</h2>
                  <span className="text-gray-400 text-lg">({items.length})</span>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item, itemIndex) => {
                    const isExpiring = isExpiringSoon(item);
                    const isExpiredItem = isExpired(item);
                    const linkedIngredient = item.ingredientId ? ingredients.find(i => i.id === item.ingredientId) : null;
                    
                    let borderClass = 'border-dark-600/30';
                    if (isExpiredItem) borderClass = 'border-red-500/50';
                    else if (isExpiring) borderClass = 'border-yellow-500/50';

                    return (
                      <div
                        key={item.id}
                        className={`glass-card rounded-2xl p-5 border ${borderClass} hover:border-primary-500/50 transition-all animate-fade-up group`}
                        style={{ animationDelay: `${itemIndex * 50}ms` }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-white text-lg mb-1">{item.name}</h3>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex items-center gap-2 bg-dark-700 rounded-xl p-1">
                                <button
                                  onClick={() => handleQuantityChange(item, item.quantity - 1)}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-dark-600 transition-all"
                                >
                                  <MinusCircle className="w-5 h-5 text-gray-400 hover:text-white" />
                                </button>
                                <span className="text-primary-400 font-bold text-xl w-12 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => handleQuantityChange(item, item.quantity + 1)}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-dark-600 transition-all"
                                >
                                  <PlusCircle className="w-5 h-5 text-gray-400 hover:text-white" />
                                </button>
                              </div>
                              <span className="text-gray-400">{item.unit}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingItem(item);
                                setShowAddModal(true);
                              }}
                              className="w-9 h-9 rounded-xl bg-dark-600 hover:bg-dark-500 flex items-center justify-center transition-all"
                            >
                              <Edit className="w-4 h-4 text-gray-300" />
                            </button>
                            <button
                              onClick={() => removeFridgeItem(item.id)}
                              className="w-9 h-9 rounded-xl bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-all"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {item.expiryDate && (
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-400">保质期：</span>
                              <span className={`font-medium ${isExpiredItem ? 'text-red-400' : isExpiring ? 'text-yellow-400' : 'text-gray-300'}`}>
                                {new Date(item.expiryDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          
                          {linkedIngredient && (
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-secondary-400" />
                              <span className="text-secondary-300">已关联食材库存：{linkedIngredient.name}</span>
                            </div>
                          )}
                          
                          {item.notes && (
                            <p className="text-gray-400 text-sm mt-2 pt-2 border-t border-dark-600/30">
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="text-center py-16 glass-card rounded-2xl border border-dark-600/30 animate-fade-up">
              <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">冰箱里还没有食材</h3>
              <p className="text-gray-400 mb-6">点击"添加食材"开始管理您的冰箱储备</p>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setShowAddModal(true);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 gradient-bg text-white rounded-xl font-bold shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-[1.02] transition-all"
              >
                <Plus className="w-5 h-5" />
                添加第一个食材
              </button>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <FridgeItemModal
          item={editingItem}
          ingredients={ingredients}
          onClose={() => {
            setShowAddModal(false);
            setEditingItem(null);
          }}
          onSave={(data) => {
            if (editingItem) {
              updateFridgeItem(editingItem.id, data);
            } else {
              addFridgeItem(data);
            }
            setShowAddModal(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}

function FridgeItemModal({
  item,
  ingredients,
  onClose,
  onSave,
}: {
  item: FridgeItem | null;
  ingredients: any[];
  onClose: () => void;
  onSave: (data: Omit<FridgeItem, 'id' | 'addedDate'>) => void;
}) {
  const [name, setName] = useState(item?.name || '');
  const [category, setCategory] = useState<FridgeItem['category']>(item?.category || '冷藏');
  const [unit, setUnit] = useState(item?.unit || '个');
  const [quantity, setQuantity] = useState(item?.quantity || 1);
  const [expiryDate, setExpiryDate] = useState(item?.expiryDate || '');
  const [notes, setNotes] = useState(item?.notes || '');
  const [ingredientId, setIngredientId] = useState<string>(item?.ingredientId || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      category,
      unit,
      quantity,
      expiryDate: expiryDate || undefined,
      notes: notes || undefined,
      ingredientId: ingredientId || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-3xl p-8 w-full max-w-lg border border-dark-600/30 animate-bounce-in">
        <h2 className="text-2xl font-bold text-white mb-6">
          {item ? '编辑食材' : '添加食材'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">食材名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-all"
              placeholder="请输入食材名称"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">分类</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-all"
            >
              <option value="冷藏">冷藏</option>
              <option value="冷冻">冷冻</option>
              <option value="常温">常温</option>
              <option value="其他">其他</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">数量</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-all"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">单位</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-all"
                placeholder="个、克、包等"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">保质期（可选）</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">关联食材库存（可选）</label>
            <select
              value={ingredientId}
              onChange={(e) => setIngredientId(e.target.value)}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-all"
            >
              <option value="">不关联</option>
              {ingredients.map((ing) => (
                <option key={ing.id} value={ing.id}>
                  {ing.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">关联后，该食材会自动同步到采购清单的库存统计中</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">备注（可选）</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-all resize-none"
              rows={3}
              placeholder="添加备注..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-dark-600 text-gray-300 rounded-xl font-semibold hover:bg-dark-500 transition-all"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 py-3 gradient-bg text-white rounded-xl font-bold shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {item ? '保存修改' : '添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
