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
  '卤味': Package,
  '海鲜': Package,
  '水果': Package,
  '酒水': Package,
};

const categoryColors = {
  '冷藏': 'text-blue-400 bg-blue-500/20',
  '冷冻': 'text-cyan-400 bg-cyan-500/20',
  '常温': 'text-yellow-400 bg-yellow-500/20',
  '其他': 'text-gray-400 bg-gray-500/20',
  '卤味': 'text-orange-400 bg-orange-500/20',
  '海鲜': 'text-blue-500 bg-blue-600/20',
  '水果': 'text-pink-400 bg-pink-500/20',
  '酒水': 'text-green-400 bg-green-500/20',
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
  const [selectedCategory, setSelectedCategory] = useState<'全部' | '冷藏' | '冷冻' | '常温' | '其他' | '卤味' | '海鲜' | '水果' | '酒水'>('全部');
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
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
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

  const expiredItems = fridgeItems.filter(isExpired);
  const expiringItems = fridgeItems.filter(isExpiringSoon).filter(item => !isExpired(item));

  return (
    <div className="min-h-screen bg-pattern pt-20 pb-24">
      <div className="max-w-7xl mx-auto px-3 md:px-4">
        {/* 顶部标题和操作按钮 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-white mb-1">冰箱储备</h1>
            <p className="text-gray-400 text-sm md:text-base">管理您的冰箱食材，关联库存清单</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSyncToInventory}
              className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-3 bg-dark-700 border border-dark-600 text-white rounded-lg md:rounded-xl font-medium hover:bg-dark-600 transition-all text-sm"
            >
              <RefreshCw className="w-4 h-4 md:w-5 md:h-5" />
              同步库存
            </button>
            <button
              onClick={() => {
                setEditingItem(null);
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 gradient-bg text-white rounded-lg md:rounded-xl font-bold shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-[1.02] transition-all text-sm"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              添加食材
            </button>
          </div>
        </div>

        {/* 同步成功提示 */}
        {showSyncSuccess && (
          <div className="mb-4 p-3 md:p-4 bg-secondary-500/20 border border-secondary-500/30 rounded-lg md:rounded-xl text-secondary-400 text-center animate-fade-up">
            <CheckCircle className="w-4 h-4 md:w-5 md:h-5 inline-block mr-2" />
            已将 {syncCount} 种关联食材同步到库存！
          </div>
        )}

        {/* 食材关联说明 */}
        {(fridgeItems.filter(item => item.ingredientId).length > 0) && (
          <div className="mb-4 p-3 md:p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg md:rounded-xl text-blue-400 text-sm flex items-start gap-2">
            <Info className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">食材关联说明</p>
              <p>您有 {fridgeItems.filter(item => item.ingredientId).length} 种食材已关联到库存系统。关联后，冰箱中的食材数量会自动同步到食材库存中。</p>
            </div>
          </div>
        )}

        {/* 过期提醒 */}
        {(expiredItems.length > 0 || expiringItems.length > 0) && (
          <div className="space-y-3 mb-6">
            {expiredItems.length > 0 && (
              <div className="glass-card rounded-lg md:rounded-xl p-3 md:p-4 border border-red-500/30 bg-red-500/10">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-5 h-5 md:w-7 md:h-7 text-red-400" />
                  <h2 className="text-base md:text-xl font-bold text-red-400">已过期食材 ({expiredItems.length})</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {expiredItems.map((item) => (
                    <span
                      key={item.id}
                      className="px-3 py-1 md:px-4 md:py-2 bg-red-500/20 border border-red-500/30 rounded-full text-red-300 text-xs md:text-sm font-medium"
                    >
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {expiringItems.length > 0 && (
              <div className="glass-card rounded-lg md:rounded-xl p-3 md:p-4 border border-yellow-500/30 bg-yellow-500/10">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 md:w-7 md:h-7 text-yellow-400" />
                  <h2 className="text-base md:text-xl font-bold text-yellow-400">即将过期 ({expiringItems.length})</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {expiringItems.map((item) => (
                    <span
                      key={item.id}
                      className="px-3 py-1 md:px-4 md:py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-300 text-xs md:text-sm font-medium"
                    >
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 搜索和筛选 */}
        <div className="glass-card rounded-lg md:rounded-xl p-3 md:p-4 mb-4 border border-dark-600/30">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索食材..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 md:py-3 bg-dark-700 border border-dark-600 rounded-lg md:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-all text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="px-3 py-2 md:px-4 md:py-3 bg-dark-700 border border-dark-600 rounded-lg md:rounded-xl text-white focus:outline-none focus:border-primary-500 transition-all text-sm"
              >
                <option value="全部">全部分类</option>
                <option value="冷藏">冷藏</option>
                <option value="冷冻">冷冻</option>
                <option value="常温">常温</option>
                <option value="卤味">卤味</option>
                <option value="海鲜">海鲜</option>
                <option value="水果">水果</option>
                <option value="酒水">酒水</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 md:px-4 md:py-3 bg-dark-700 border border-dark-600 rounded-lg md:rounded-xl text-white focus:outline-none focus:border-primary-500 transition-all text-sm"
              >
                <option value="added">添加时间</option>
                <option value="name">名称</option>
                <option value="expiry">保质期</option>
              </select>
            </div>
          </div>
        </div>

        {/* 食材列表 */}
        <div className="space-y-4">
          {Object.entries(groupedItems).map(([category, items], index) => {
            const Icon = categoryIcons[category as keyof typeof categoryIcons];
            const colorClass = categoryColors[category as keyof typeof categoryColors];
            
            return (
              <div key={category} className="animate-fade-up" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center ${colorClass}`}>
                    <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <h2 className="text-lg md:text-2xl font-bold text-white">{category}</h2>
                  <span className="text-gray-400 text-sm md:text-lg">({items.length})</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
                        className={`glass-card rounded-lg md:rounded-xl p-3 md:p-4 border ${borderClass} hover:border-primary-500/50 transition-all animate-fade-up`}
                        style={{ animationDelay: `${itemIndex * 30}ms` }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-bold text-white text-sm md:text-lg mb-1">{item.name}</h3>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 bg-dark-700 rounded-lg p-1">
                                <button
                                  onClick={() => handleQuantityChange(item, item.quantity - 1)}
                                  className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-md hover:bg-dark-600 transition-all"
                                >
                                  <MinusCircle className="w-4 h-4 text-gray-400 hover:text-white" />
                                </button>
                                <span className="text-primary-400 font-bold text-sm md:text-xl w-8 md:w-10 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => handleQuantityChange(item, item.quantity + 1)}
                                  className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-md hover:bg-dark-600 transition-all"
                                >
                                  <PlusCircle className="w-4 h-4 text-gray-400 hover:text-white" />
                                </button>
                              </div>
                              <span className="text-gray-400 text-xs md:text-sm">{item.unit}</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setEditingItem(item);
                                setShowAddModal(true);
                              }}
                              className="w-7 h-7 md:w-9 md:h-9 rounded-lg bg-dark-600 hover:bg-dark-500 flex items-center justify-center transition-all"
                            >
                              <Edit className="w-3 h-3 md:w-4 md:h-4 text-gray-300" />
                            </button>
                            <button
                              onClick={() => removeFridgeItem(item.id)}
                              className="w-7 h-7 md:w-9 md:h-9 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-all"
                            >
                              <Trash2 className="w-3 h-3 md:w-4 md:h-4 text-red-400" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          {item.expiryDate && (
                            <div className="flex items-center gap-2 text-xs md:text-sm">
                              <Calendar className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                              <span className="text-gray-400">保质期：</span>
                              <span className={`font-medium ${isExpiredItem ? 'text-red-400' : isExpiring ? 'text-yellow-400' : 'text-gray-300'}`}>
                                {new Date(item.expiryDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          
                          {linkedIngredient && (
                            <div className="flex items-center gap-2 text-xs md:text-sm">
                              <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-secondary-400" />
                              <span className="text-secondary-300">已关联：{linkedIngredient.name}</span>
                            </div>
                          )}
                          
                          {item.notes && (
                            <p className="text-gray-400 text-xs md:text-sm mt-2 pt-2 border-t border-dark-600/30">
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
            <div className="text-center py-12 glass-card rounded-lg md:rounded-xl border border-dark-600/30">
              <Package className="w-12 h-12 md:w-16 md:h-16 text-gray-500 mx-auto mb-3" />
              <h3 className="text-lg md:text-xl font-bold text-white mb-2">冰箱里还没有食材</h3>
              <p className="text-gray-400 text-sm mb-4">点击"添加食材"开始管理您的冰箱储备</p>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setShowAddModal(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 gradient-bg text-white rounded-lg md:rounded-xl font-bold shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-[1.02] transition-all text-sm"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                添加第一个食材
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 添加/编辑弹窗 */}
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
      <div className="glass-card rounded-xl md:rounded-2xl p-6 md:p-8 w-full max-w-md border border-dark-600/30 animate-bounce-in">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">
          {item ? '编辑食材' : '添加食材'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">食材名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-all"
              placeholder="请输入食材名称"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">分类</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-all"
            >
              <option value="冷藏">冷藏</option>
              <option value="冷冻">冷冻</option>
              <option value="常温">常温</option>
              <option value="卤味">卤味</option>
              <option value="海鲜">海鲜</option>
              <option value="水果">水果</option>
              <option value="酒水">酒水</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">数量</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-all"
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
                className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-all"
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
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">关联食材库存（可选）</label>
            <select
              value={ingredientId}
              onChange={(e) => setIngredientId(e.target.value)}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-all"
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
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-all resize-none"
              rows={2}
              placeholder="添加备注..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-dark-600 text-gray-300 rounded-lg font-semibold hover:bg-dark-500 transition-all"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 py-3 gradient-bg text-white rounded-lg font-bold shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {item ? '保存修改' : '添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
