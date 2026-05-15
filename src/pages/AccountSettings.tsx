import { User, Bell, Shield, Lock, Key, Save, Check, X, Eye, EyeOff, Smartphone } from 'lucide-react';
import { useState } from 'react';

export function AccountSettings() {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(() => {
    const stored = localStorage.getItem('user_profile');
    return stored ? JSON.parse(stored) : {
      name: '赵梓涵',
      nickname: '小涵涵',
      phone: '',
      email: '',
      location: '',
    };
  });
  const [tempProfile, setTempProfile] = useState(profile);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const handleSave = () => {
    setProfile(tempProfile);
    localStorage.setItem('user_profile', JSON.stringify(tempProfile));
    setIsEditing(false);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setIsEditing(false);
  };

  const tabs = [
    { id: 'profile' as const, label: '个人信息', icon: User },
    { id: 'notifications' as const, label: '通知设置', icon: Bell },
    { id: 'security' as const, label: '安全设置', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-2 bg-dark-700/50 p-1 rounded-2xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'gradient-bg text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-dark-600/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'profile' && (
        <div className="glass-card rounded-2xl p-6 border border-dark-600/30 animate-fade-up">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">个人信息</h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-primary-500/20 text-primary-400 rounded-xl font-medium hover:bg-primary-500/30 transition-all"
              >
                编辑
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-dark-600 text-gray-300 rounded-xl font-medium hover:bg-dark-500 transition-all flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 gradient-bg text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  保存
                </button>
              </div>
            )}
          </div>

          {showSaveSuccess && (
            <div className="mb-4 p-4 bg-secondary-500/20 border border-secondary-500/30 rounded-xl text-secondary-400 text-center flex items-center justify-center gap-2 animate-fade-up">
              <Check className="w-5 h-5" />
              保存成功！
            </div>
          )}

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">姓名</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempProfile.name}
                    onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-all"
                  />
                ) : (
                  <p className="px-4 py-3 bg-dark-700/50 rounded-xl text-white">{profile.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">昵称</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempProfile.nickname}
                    onChange={(e) => setTempProfile({ ...tempProfile, nickname: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-all"
                  />
                ) : (
                  <p className="px-4 py-3 bg-dark-700/50 rounded-xl text-white">{profile.nickname}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">手机号</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={tempProfile.phone}
                  onChange={(e) => setTempProfile({ ...tempProfile, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-all"
                  placeholder="请输入手机号"
                />
              ) : (
                <p className="px-4 py-3 bg-dark-700/50 rounded-xl text-white">{profile.phone || '未设置'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">邮箱</label>
              {isEditing ? (
                <input
                  type="email"
                  value={tempProfile.email}
                  onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-all"
                  placeholder="请输入邮箱"
                />
              ) : (
                <p className="px-4 py-3 bg-dark-700/50 rounded-xl text-white">{profile.email || '未设置'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">所在地</label>
              {isEditing ? (
                <input
                  type="text"
                  value={tempProfile.location}
                  onChange={(e) => setTempProfile({ ...tempProfile, location: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-all"
                  placeholder="请输入所在地"
                />
              ) : (
                <p className="px-4 py-3 bg-dark-700/50 rounded-xl text-white">{profile.location || '未设置'}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="glass-card rounded-2xl p-6 border border-dark-600/30 animate-fade-up">
          <h3 className="text-lg font-bold text-white mb-6">通知设置</h3>
          <div className="space-y-4">
            {[
              { label: '订单状态变更', desc: '接收订单状态更新通知', enabled: true },
              { label: '新订单提醒', desc: '有新订单时立即通知', enabled: true },
              { label: '食材库存提醒', desc: '库存不足时提醒采购', enabled: true },
              { label: '每日推荐', desc: '每日推荐菜品通知', enabled: false },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-dark-700/50 rounded-xl">
                <div>
                  <h4 className="font-medium text-white">{item.label}</h4>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
                <button
                  onClick={() => {}}
                  className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                    item.enabled ? 'gradient-bg' : 'bg-dark-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-lg ${
                      item.enabled ? 'left-7' : 'left-1'
                    }`}
                  ></div>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <SecuritySettings />
      )}
    </div>
  );
}

function SecuritySettings() {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);

  return (
    <div className="glass-card rounded-2xl p-6 border border-dark-600/30 animate-fade-up">
      <h3 className="text-lg font-bold text-white mb-6">安全设置</h3>
      <div className="space-y-4">
        <button 
          onClick={() => setShowPasswordModal(true)}
          className="w-full flex items-center justify-between p-5 bg-dark-700/50 rounded-xl hover:bg-dark-700 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary-400" />
            </div>
            <div className="text-left">
              <h4 className="font-medium text-white">修改访问密码</h4>
              <p className="text-sm text-gray-400">更改您的登录密码</p>
            </div>
          </div>
          <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button className="w-full flex items-center justify-between p-5 bg-dark-700/50 rounded-xl hover:bg-dark-700 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Key className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-left">
              <h4 className="font-medium text-white">双重验证</h4>
              <p className="text-sm text-gray-400">启用双重身份验证</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
            未启用
          </span>
        </button>

        <button 
          onClick={() => setShowDeviceModal(true)}
          className="w-full flex items-center justify-between p-5 bg-dark-700/50 rounded-xl hover:bg-dark-700 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-red-400" />
            </div>
            <div className="text-left">
              <h4 className="font-medium text-white">登录设备管理</h4>
              <p className="text-sm text-gray-400">查看并管理已登录设备</p>
            </div>
          </div>
          <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}

      {showDeviceModal && (
        <DeviceManagementModal onClose={() => setShowDeviceModal(false)} />
      )}
    </div>
  );
}

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = () => {
    setError('');

    if (!currentPassword) {
      setError('请输入当前密码');
      return;
    }

    const storedPassword = localStorage.getItem('app_password');
    const decrypted = storedPassword ? atob(storedPassword) : '';
    
    // 支持新旧两种密码格式
    if (currentPassword !== decrypted && currentPassword + 'zihan_secret' !== decrypted) {
      setError('当前密码错误');
      return;
    }

    if (newPassword.length < 4) {
      setError('新密码至少4位');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('两次密码不一致');
      return;
    }

    const encrypted = btoa(newPassword);
    localStorage.setItem('app_password', encrypted);
    sessionStorage.removeItem('current_password');
    
    setSuccess(true);
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl p-8 w-full max-w-md border border-dark-600/30 animate-bounce-in">
        <h3 className="text-2xl font-bold text-white mb-6">修改访问密码</h3>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-secondary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-secondary-400" />
            </div>
            <p className="text-xl text-white font-semibold">密码修改成功！</p>
            <p className="text-gray-400 mt-2">即将重新登录...</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">当前密码</label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                    placeholder="请输入当前密码"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">新密码</label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                    placeholder="请输入新密码（至少4位）"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">确认新密码</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                  placeholder="请再次输入新密码"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                  {error}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-dark-600 text-gray-300 rounded-xl font-medium hover:bg-dark-500 transition-all"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-3 gradient-bg text-white rounded-xl font-bold hover:shadow-lg transition-all"
              >
                确认修改
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DeviceManagementModal({ onClose }: { onClose: () => void }) {
  const devices = [
    { name: 'Chrome浏览器', location: '北京', time: '2026-05-14 14:30', current: true },
    { name: 'Safari浏览器', location: '北京', time: '2026-05-13 09:15', current: false },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl p-8 w-full max-w-lg border border-dark-600/30 animate-bounce-in">
        <h3 className="text-2xl font-bold text-white mb-6">登录设备管理</h3>

        <div className="space-y-3 mb-6">
          {devices.map((device, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-dark-700/50 rounded-xl">
              <div>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-white">{device.name}</span>
                  {device.current && (
                    <span className="px-2 py-0.5 bg-secondary-500/20 text-secondary-400 rounded text-xs">当前设备</span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-1">{device.location} · {device.time}</p>
              </div>
              {!device.current && (
                <button className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-all">
                  移除
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-3 bg-dark-600 text-gray-300 rounded-xl font-medium hover:bg-dark-500 transition-all"
        >
          关闭
        </button>
      </div>
    </div>
  );
}
