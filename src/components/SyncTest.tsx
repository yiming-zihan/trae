import { useState } from 'react';
import { useMenuStore } from '@/store/menuStore';
import { RefreshCw, Database, CheckCircle, XCircle } from 'lucide-react';

export function SyncTest() {
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  
  const orders = useMenuStore((state) => state.orders);
  const ingredients = useMenuStore((state) => state.ingredients);
  const fridgeItems = useMenuStore((state) => state.fridgeItems);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runTest = async () => {
    setTestStatus('testing');
    setLogs([]);
    addLog('开始测试 Firebase 同步...');

    try {
      addLog(`📊 当前本地数据：`);
      addLog(`  - 订单数: ${orders.length}`);
      addLog(`  - 食材数: ${ingredients.length}`);
      addLog(`  - 冰箱物品数: ${fridgeItems.length}`);

      addLog('🔄 等待 3 秒后再次检查数据...');
      await new Promise((resolve) => setTimeout(resolve, 3000));

      addLog(`📊 3秒后数据：`);
      addLog(`  - 订单数: ${useMenuStore.getState().orders.length}`);
      addLog(`  - 食材数: ${useMenuStore.getState().ingredients.length}`);
      addLog(`  - 冰箱物品数: ${useMenuStore.getState().fridgeItems.length}`);

      // 检查是否有 Firebase 相关的日志
      const hasFirebaseLogs = logs.some((log) => 
        log.includes('Firebase') || 
        log.includes('Syncing') || 
        log.includes('synced')
      );

      if (hasFirebaseLogs) {
        addLog('✅ Firebase 同步功能已激活');
        setTestStatus('success');
      } else {
        addLog('⚠️ 未检测到 Firebase 同步活动');
        addLog('💡 建议：请在另一个设备上操作数据，然后回来刷新页面');
        setTestStatus('idle');
      }
    } catch (error) {
      addLog(`❌ 测试失败: ${error}`);
      setTestStatus('error');
    }
  };

  return (
    <div className="glass-card rounded-2xl p-4 md:p-6 mb-6 border border-dark-600/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Firebase 同步测试</h3>
            <p className="text-xs text-gray-400">验证数据同步状态</p>
          </div>
        </div>
        <button
          onClick={runTest}
          disabled={testStatus === 'testing'}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
          {testStatus === 'testing' ? '测试中...' : '运行测试'}
        </button>
      </div>

      {/* 状态显示 */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-dark-700/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-primary-400">{orders.length}</p>
          <p className="text-xs text-gray-400">订单</p>
        </div>
        <div className="bg-dark-700/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-400">{ingredients.length}</p>
          <p className="text-xs text-gray-400">食材</p>
        </div>
        <div className="bg-dark-700/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-blue-400">{fridgeItems.length}</p>
          <p className="text-xs text-gray-400">冰箱物品</p>
        </div>
      </div>

      {/* 状态指示器 */}
      <div className="flex items-center gap-2 mb-4">
        {testStatus === 'success' && (
          <>
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-sm text-green-400">Firebase 同步正常</span>
          </>
        )}
        {testStatus === 'error' && (
          <>
            <XCircle className="w-5 h-5 text-red-400" />
            <span className="text-sm text-red-400">同步测试失败</span>
          </>
        )}
        {testStatus === 'idle' && (
          <span className="text-sm text-gray-400">点击"运行测试"开始验证</span>
        )}
        {testStatus === 'testing' && (
          <span className="text-sm text-primary-400">正在测试中...</span>
        )}
      </div>

      {/* 日志输出 */}
      {logs.length > 0 && (
        <div className="bg-dark-900/50 rounded-lg p-3 font-mono text-xs">
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div key={index} className="text-gray-300 whitespace-pre-wrap">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="mt-4 p-3 bg-dark-700/30 rounded-lg">
        <p className="text-xs text-gray-400 mb-2">💡 使用说明：</p>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>1. 在此设备上查看当前数据</li>
          <li>2. 在另一设备（手机/电脑）上操作数据</li>
          <li>3. 等待 3 秒后在此设备刷新页面</li>
          <li>4. 如果数据已同步，说明 Firebase 工作正常</li>
        </ul>
      </div>
    </div>
  );
}
