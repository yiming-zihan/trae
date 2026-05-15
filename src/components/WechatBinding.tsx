import { useState, useEffect } from 'react';
import { MessageCircle, QrCode, CheckCircle, Unlink, RefreshCw, ExternalLink, Smartphone, Mail, Info, AlertCircle, Copy, Save, Send } from 'lucide-react';
import { useMenuStore } from '@/store/menuStore';

interface WechatBindingProps {
  userId: string;
  userRole: 'wife' | 'husband';
}

type NotificationService = 'pushplus' | 'serverchan' | 'wework' | 'email';

interface NotificationConfig {
  service: NotificationService;
  token?: string;
  email?: string;
  webhookUrl?: string;
}

export function WechatBinding({ userId, userRole }: WechatBindingProps) {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [selectedService, setSelectedService] = useState<NotificationService>('pushplus');
  const [config, setConfig] = useState<NotificationConfig>({ service: 'pushplus' });
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  
  const { sendNotification } = useMenuStore();

  const getConfig = () => {
    const configData = localStorage.getItem(`notification_config_${userId}`);
    return configData ? JSON.parse(configData) : null;
  };

  const notificationConfig = getConfig();

  useEffect(() => {
    if (notificationConfig) {
      setConfig(notificationConfig);
      setSelectedService(notificationConfig.service);
    }
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    const configToSave = {
      ...config,
      configTime: new Date().toISOString()
    };
    
    localStorage.setItem(`notification_config_${userId}`, JSON.stringify(configToSave));
    
    const storeData = localStorage.getItem('menu_store');
    if (storeData) {
      const parsed = JSON.parse(storeData);
      const userIndex = parsed.users?.findIndex((u: any) => u.id === userId);
      if (userIndex !== -1) {
        parsed.users[userIndex].wechatId = `${config.service}_configured`;
        localStorage.setItem('menu_store', JSON.stringify(parsed));
      }
    }
    
    setIsConfiguring(false);
    window.location.reload();
  };

  const handleTestNotification = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    const success = await sendNotification(
      userId,
      '✅ 测试通知',
      `
**梓涵小厨测试通知**

这是一条测试消息，时间：${new Date().toLocaleString('zh-CN')}

如果您收到了这条消息，说明通知配置成功！

---
祝您用餐愉快 🍳
      `
    );
    
    setTestResult(success ? 'success' : 'error');
    setIsTesting(false);
    setTimeout(() => setTestResult(null), 5000);
  };

  const handleRemove = () => {
    if (confirm('确定要移除通知配置吗？移除后将无法收到消息通知。')) {
      localStorage.removeItem(`notification_config_${userId}`);
      
      const storeData = localStorage.getItem('menu_store');
      if (storeData) {
        const parsed = JSON.parse(storeData);
        const userIndex = parsed.users?.findIndex((u: any) => u.id === userId);
        if (userIndex !== -1) {
          parsed.users[userIndex].wechatId = null;
          localStorage.setItem('menu_store', JSON.stringify(parsed));
        }
      }
      
      window.location.reload();
    }
  };

  const services = [
    {
      id: 'pushplus' as NotificationService,
      name: 'PushPlus（推荐）',
      description: '免费微信推送服务，个人使用非常方便',
      url: 'https://www.pushplus.plus',
      steps: [
        '打开 PushPlus 官网',
        '使用微信扫码登录',
        '获取你的 Token',
        '在下方填入 Token 保存'
      ]
    },
    {
      id: 'serverchan' as NotificationService,
      name: 'Server酱',
      description: '老牌微信推送服务，简单可靠',
      url: 'https://sct.ftqq.com',
      steps: [
        '打开 Server酱 官网',
        '使用微信扫码登录',
        '获取你的 SendKey',
        '在下方填入 SendKey 保存'
      ]
    },
    {
      id: 'wework' as NotificationService,
      name: '企业微信群机器人',
      description: '适合有企业微信的用户，消息推送更稳定',
      url: 'https://work.weixin.qq.com',
      steps: [
        '创建企业微信群（企业微信）',
        '添加群机器人',
        '获取 Webhook 地址',
        '在下方填入 Webhook 地址保存'
      ]
    },
    {
      id: 'email' as NotificationService,
      name: '邮件通知',
      description: '备选方案，通过邮件接收通知',
      url: '',
      steps: [
        '输入你的邮箱地址',
        '保存后将通过邮件发送通知',
        '可以在手机邮箱 App 中设置提醒'
      ]
    }
  ];

  return (
    <div className="glass-card rounded-2xl p-6 border border-dark-600/30">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        通知配置
      </h3>

      <p className="text-gray-400 mb-6">
        {userRole === 'wife'
          ? '配置通知后，您提交的点菜订单将通知谢一鸣'
          : '配置通知后，您将收到赵梓涵点菜的消息通知'}
      </p>

      {notificationConfig ? (
        <div className="space-y-6">
          <div className="p-4 bg-secondary-500/20 rounded-xl border border-secondary-500/30">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-6 h-6 text-secondary-400" />
              <span className="font-semibold text-secondary-400">
                已配置 {services.find(s => s.id === notificationConfig.service)?.name}
              </span>
            </div>
            <div className="text-sm text-gray-400 space-y-1">
              <p>配置时间：{new Date(notificationConfig.configTime || Date.now()).toLocaleString('zh-CN')}</p>
              {notificationConfig.service === 'email' && notificationConfig.email && (
                <p>邮箱：{notificationConfig.email}</p>
              )}
              {notificationConfig.service !== 'email' && (
                <p>Token/Webhook：已配置 ✓</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {testResult === 'success' && (
              <div className="p-4 bg-green-500/20 rounded-xl border border-green-500/30 text-green-300 text-center">
                ✅ 测试通知发送成功！请检查您的微信/邮箱
              </div>
            )}
            {testResult === 'error' && (
              <div className="p-4 bg-red-500/20 rounded-xl border border-red-500/30 text-red-300 text-center">
                ❌ 测试通知发送失败，请检查配置
              </div>
            )}
            
            <button
              onClick={handleTestNotification}
              disabled={isTesting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isTesting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  发送中...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  测试通知
                </>
              )}
            </button>
            
            <button
              onClick={() => setIsConfiguring(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              重新配置
            </button>
            <button
              onClick={handleRemove}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-dark-700 text-gray-300 rounded-xl font-medium hover:bg-dark-600 transition-all"
            >
              <Unlink className="w-5 h-5" />
              移除配置
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {!isConfiguring ? (
            <button
              onClick={() => setIsConfiguring(true)}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 gradient-bg text-white rounded-xl font-bold text-lg shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-[1.02] transition-all"
            >
              <Smartphone className="w-6 h-6" />
              开始配置通知
            </button>
          ) : (
            <div className="space-y-6 animate-fade-up">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">选择通知方式</label>
                <div className="grid gap-3">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => {
                        setSelectedService(service.id);
                        setConfig({ ...config, service: service.id });
                      }}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedService === service.id
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-dark-600 bg-dark-700/50 hover:border-dark-500'
                      }`}
                    >
                      <div className="font-semibold text-white mb-1">{service.name}</div>
                      <div className="text-sm text-gray-400">{service.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <h4 className="font-medium text-blue-300 mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  配置步骤
                </h4>
                <ol className="text-sm text-blue-400/80 space-y-2">
                  {services.find(s => s.id === selectedService)?.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 bg-blue-500/30 rounded-full text-xs flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                {services.find(s => s.id === selectedService)?.url && (
                  <a
                    href={services.find(s => s.id === selectedService)?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    打开官网
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              {selectedService === 'email' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">邮箱地址</label>
                  <input
                    type="email"
                    value={config.email || ''}
                    onChange={(e) => setConfig({ ...config, email: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-all"
                    placeholder="请输入你的邮箱地址"
                  />
                </div>
              ) : selectedService === 'wework' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Webhook 地址</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={config.webhookUrl || ''}
                      onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-all pr-24"
                      placeholder="请输入企业微信群机器人 Webhook 地址"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Token / SendKey</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={config.token || ''}
                      onChange={(e) => setConfig({ ...config, token: e.target.value })}
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-all pr-24"
                      placeholder={selectedService === 'pushplus' ? '请输入 PushPlus Token' : '请输入 Server酱 SendKey'}
                    />
                    <button
                      onClick={() => handleCopy(config.token || '')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-dark-600 text-gray-300 rounded-lg text-sm hover:bg-dark-500 transition-colors"
                    >
                      {copied ? '已复制' : '粘贴'}
                    </button>
                  </div>
                </div>
              )}

              <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-300 mb-1">重要提醒</h4>
                    <p className="text-sm text-amber-400/80">
                      配置完成后，您可以测试通知功能。建议先给自己发送一条测试消息，确保配置正确。
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={handleSave}
                  className="w-full py-4 gradient-bg text-white rounded-xl font-bold text-lg shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-6 h-6" />
                  保存配置
                </button>

                <button
                  onClick={() => {
                    setIsConfiguring(false);
                    setConfig(notificationConfig || { service: 'pushplus' });
                  }}
                  className="w-full py-3 bg-dark-700 text-gray-300 rounded-xl font-medium hover:bg-dark-600 transition-all"
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
