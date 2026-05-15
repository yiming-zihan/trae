import { HelpCircle, Book, MessageCircle, Phone, Mail, ChevronDown, ChevronUp, ExternalLink, Users, Heart } from 'lucide-react';
import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
  icon: any;
}

export function HelpPage() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['basics']));

  const toggleSection = (section: string) => {
    const newSections = new Set(openSections);
    if (newSections.has(section)) {
      newSections.delete(section);
    } else {
      newSections.add(section);
    }
    setOpenSections(newSections);
  };

  const faqs: { [key: string]: FAQItem[] } = {
    basics: [
      {
        question: '梓涵小厨是什么？',
        answer: '梓涵小厨是一款专为家庭设计的菜单管理应用，帮助您和您的伴侣更好地管理日常饮食。您可以点菜、管理冰箱库存、查看采购清单，让做饭变得更加简单有序。',
        icon: Heart,
      },
      {
        question: '如何开始使用？',
        answer: '首次使用时，您需要设置一个访问密码来保护您的隐私。然后可以在"点菜"页面选择想吃的菜品，系统会自动计算所需食材并提醒您采购。',
        icon: Book,
      },
      {
        question: '应用的主要功能有哪些？',
        answer: '应用包含以下主要功能：\n• 首页：查看纪念日和重要日期倒计时\n• 点菜：选择想吃的菜品并提交订单\n• 冰箱：管理您的食材库存\n• 清单：查看需要采购的食材\n• 历史：查看过去的订单记录\n• 设置：管理个人信息和偏好设置',
        icon: Users,
      },
    ],
    orders: [
      {
        question: '如何下单？',
        answer: '进入"点菜"页面，选择您想吃的菜品，点击菜品卡片上的"添加"按钮。选好后点击右下角的"提交"按钮即可下单。',
        icon: Book,
      },
      {
        question: '下单后会发生什么？',
        answer: '下单后，系统会自动计算所需食材并在"清单"页面显示。您可以查看需要采购的食材数量。',
        icon: MessageCircle,
      },
      {
        question: '可以修改或取消订单吗？',
        answer: '目前订单创建后无法直接修改或取消。您可以在"历史"页面查看所有订单记录。',
        icon: Book,
      },
    ],
    fridge: [
      {
        question: '冰箱管理有什么作用？',
        answer: '冰箱管理帮助您记录家中现有的食材。系统会根据冰箱中的食材和您的订单，自动计算还需要采购哪些食材，避免重复购买。',
        icon: Heart,
      },
      {
        question: '如何添加食材到冰箱？',
        answer: '进入"冰箱"页面，点击右上角的"添加食材"按钮。填写食材名称、数量、分类等信息，可以关联到食材清单方便统计。',
        icon: Book,
      },
      {
        question: '食材数量如何调整？',
        answer: '在冰箱页面，每个食材卡片上都有 +/- 按钮，可以直接调整数量。数量变化会自动同步到食材库存中。',
        icon: Book,
      },
    ],
    account: [
      {
        question: '如何修改访问密码？',
        answer: '进入"设置" → "隐私安全" → "修改访问密码"。需要先输入当前密码，然后设置新密码。',
        icon: Heart,
      },
      {
        question: '忘记密码怎么办？',
        answer: '在登录页面点击"修改访问密码"，通过验证已绑定的手机号来重置密码。',
        icon: Book,
      },
      {
        question: '如何启用自动登录？',
        answer: '在登录页面，勾选"记住密码"选项。下次访问时将自动登录，无需再次输入密码。',
        icon: Book,
      },
    ],
    themes: [
      {
        question: '可以更换应用主题吗？',
        answer: '可以！进入"设置" → "主题设置"，选择您喜欢的主题。目前提供5种主题：暗夜紫、纯净白、海洋蓝、森林绿、晚霞橙。',
        icon: Heart,
      },
      {
        question: '主题会保存吗？',
        answer: '是的，您的主题选择会自动保存，下次打开应用时会自动应用您选择的主题。',
        icon: Book,
      },
    ],
  };

  const sectionTitles = {
    basics: { title: '基础介绍', icon: Heart, color: 'text-primary-400' },
    orders: { title: '订单相关', icon: Book, color: 'text-secondary-400' },
    fridge: { title: '冰箱管理', icon: Heart, color: 'text-primary-400' },
    account: { title: '账户设置', icon: Book, color: 'text-secondary-400' },
    themes: { title: '主题相关', icon: Heart, color: 'text-primary-400' },
  };

  return (
    <div className="min-h-screen bg-pattern pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => window.history.back()}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回设置
        </button>

        <div className="glass-card rounded-3xl p-8 border border-dark-600/30 mb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 gradient-bg rounded-3xl mb-4">
              <HelpCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">帮助与支持</h1>
            <p className="text-gray-400 text-lg">遇到问题？这里有您需要的答案</p>
          </div>

          {/* 快速链接 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button className="p-6 bg-dark-700/50 rounded-2xl border border-dark-600/30 hover:border-primary-500/50 transition-all group">
              <Book className="w-8 h-8 text-primary-400 mb-3 mx-auto group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white mb-1">使用指南</h3>
              <p className="text-sm text-gray-400">了解基本操作</p>
            </button>
            <button className="p-6 bg-dark-700/50 rounded-2xl border border-dark-600/30 hover:border-secondary-500/50 transition-all group">
              <MessageCircle className="w-8 h-8 text-secondary-400 mb-3 mx-auto group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white mb-1">常见问题</h3>
              <p className="text-sm text-gray-400">FAQ 解答</p>
            </button>
            <button className="p-6 bg-dark-700/50 rounded-2xl border border-dark-600/30 hover:border-yellow-500/50 transition-all group">
              <Heart className="w-8 h-8 text-yellow-400 mb-3 mx-auto group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white mb-1">关于我们</h3>
              <p className="text-sm text-gray-400">了解更多信息</p>
            </button>
          </div>
        </div>

        {/* FAQ 列表 */}
        <div className="space-y-4">
          {Object.entries(faqs).map(([section, items]) => {
            const sectionInfo = sectionTitles[section as keyof typeof sectionTitles];
            const Icon = sectionInfo.icon;
            const isOpen = openSections.has(section);

            return (
              <div key={section} className="glass-card rounded-2xl border border-dark-600/30 overflow-hidden">
                <button
                  onClick={() => toggleSection(section)}
                  className="w-full flex items-center justify-between p-6 hover:bg-dark-700/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${sectionInfo.color} bg-opacity-20 flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${sectionInfo.color}`} />
                    </div>
                    <h2 className="text-xl font-bold text-white">{sectionInfo.title}</h2>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-6 h-6 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-400" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 space-y-3">
                    {items.map((faq, index) => {
                      const FAQIcon = faq.icon;
                      return (
                        <div
                          key={index}
                          className="bg-dark-700/50 rounded-xl p-5 border border-dark-600/30"
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <FAQIcon className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                            <h3 className="font-semibold text-white">{faq.question}</h3>
                          </div>
                          <div className="pl-8">
                            <p className="text-gray-400 whitespace-pre-line leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 联系我们 */}
        <div className="glass-card rounded-3xl p-8 border border-dark-600/30 mt-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">联系我们</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4 p-4 bg-dark-700/50 rounded-xl">
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">反馈邮箱</h3>
                <p className="text-gray-400 text-sm">support@zihanxiaocu.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-dark-700/50 rounded-xl">
              <div className="w-12 h-12 bg-secondary-500/20 rounded-xl flex items-center justify-center">
                <Phone className="w-6 h-6 text-secondary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">客服热线</h3>
                <p className="text-gray-400 text-sm">400-888-8888</p>
              </div>
            </div>
          </div>
          <div className="mt-6 p-6 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-xl border border-primary-500/20">
            <div className="flex items-center gap-3 mb-3">
              <Heart className="w-6 h-6 text-primary-400" />
              <h3 className="font-bold text-white text-lg">感谢您的使用</h3>
            </div>
            <p className="text-gray-300 leading-relaxed">
              梓涵小厨致力于为每个家庭提供便捷的饮食管理体验。我们会持续改进产品，为您带来更多实用的功能。如有任何建议或问题，欢迎随时联系我们。
            </p>
          </div>
        </div>

        {/* 版本信息 */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>梓涵小厨 v1.0.0</p>
          <p className="mt-1">用心烹饪每一道菜，为您和家人带来温暖</p>
        </div>
      </div>
    </div>
  );
}
