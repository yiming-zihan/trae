import { User, Bell, Shield, Smartphone, Settings, ChevronRight, Lock, AlertTriangle } from 'lucide-react';
import { useMenuStore } from '@/store/menuStore';
import { useState } from 'react';
import { AccountSettings } from './AccountSettings';
import { Palette, HelpCircle } from 'lucide-react';
import { WechatBinding } from '@/components/WechatBinding';
import { ThemeSettings } from '@/components/ThemeSettings';
import { HelpPage } from '@/components/HelpPage';

export function SettingsPage() {
  const { currentUser, users, setCurrentUser } = useMenuStore();
  const [showSecurityTip, setShowSecurityTip] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const settingsGroups = [
    {
      title: '账户设置',
      items: [
        {
          id: 'account',
          icon: User,
          label: '个人信息',
          description: '管理您的个人资料',
          action: () => setActiveSection('account'),
        },
        {
          icon: Bell,
          label: '通知设置',
          description: '配置微信消息通知',
          action: () => setActiveSection('notifications'),
        },
        {
          icon: Shield,
          label: '隐私安全',
          description: '账号安全设置',
          action: () => setActiveSection('security'),
        },
      ],
    },
    {
      title: '功能设置',
      items: [
        {
          icon: Palette,
          label: '主题设置',
          description: '自定义界面外观',
          action: () => setActiveSection('theme'),
        },
      ],
    },
    {
      title: '帮助与支持',
      items: [
        {
          icon: HelpCircle,
          label: '使用帮助',
          description: '了解如何使用本应用',
          action: () => setActiveSection('help'),
        },
      ],
    },
  ];

  if (activeSection === 'account' || activeSection === 'notifications' || activeSection === 'security') {
    return (
      <div className="min-h-screen bg-pattern pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => setActiveSection(null)}
            className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回设置
          </button>
          <AccountSettings />
        </div>
      </div>
    );
  }

  if (activeSection === 'theme') {
    return <ThemeSettings />;
  }

  if (activeSection === 'help') {
    return <HelpPage />;
  }

  return (
    <div className="min-h-screen bg-pattern pt-24 pb-20">
      {showSecurityTip && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 animate-fade-up">
          <div className="max-w-4xl mx-auto px-4 py-5">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-300 mb-1">安全提示</h3>
                <p className="text-yellow-400/80 text-sm">
                  当前为本地开发环境，使用 HTTP 协议。正式部署时请配置 HTTPS 以保护数据安全。
                </p>
              </div>
              <button
                onClick={() => setShowSecurityTip(false)}
                className="text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 pt-8">
        <div className="mb-8 animate-fade-up">
          <h1 className="text-4xl font-bold text-white mb-2">设置</h1>
          <p className="text-gray-400 text-lg">管理您的应用偏好</p>
        </div>

        <div className="space-y-8">
          {settingsGroups.map((group, groupIndex) => (
            <div key={group.title} className="animate-fade-up" style={{ animationDelay: `${groupIndex * 100}ms` }}>
              <h2 className="text-lg font-semibold text-gray-300 mb-4">{group.title}</h2>
              <div className="glass-card rounded-2xl p-2 border border-dark-600/30">
                <div className="space-y-1">
                  {group.items.map((item, itemIndex) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id || itemIndex}
                        onClick={item.action}
                        className="w-full flex items-center justify-between p-4 hover:bg-dark-700/50 rounded-xl transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-dark-700 rounded-xl flex items-center justify-center group-hover:bg-dark-600 transition-all">
                            <Icon className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-medium text-white">{item.label}</h3>
                            <p className="text-sm text-gray-400">{item.description}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center animate-fade-up animate-delay-300">
          <div className="glass-card rounded-2xl p-6 border border-dark-600/30">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-white">梓涵小厨</h3>
                <p className="text-sm text-gray-400">版本 1.0.0</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              用心烹饪每一道菜，为您和家人带来温暖
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
