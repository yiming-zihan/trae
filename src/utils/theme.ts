export type ThemeName = 'dark' | 'light' | 'ocean' | 'forest' | 'sunset';

export interface Theme {
  name: string;
  id: ThemeName;
  description: string;
  preview: string;
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    secondaryLight: string;
    secondaryDark: string;
    background: string;
    surface: string;
    surfaceLight: string;
    surfaceDark: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
}

export const themes: Record<ThemeName, Theme> = {
  dark: {
    name: '暗夜紫',
    id: 'dark',
    description: '深邃神秘的紫黑配色',
    preview: 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900',
    colors: {
      primary: '#ff6b35',
      primaryLight: '#ff8f66',
      primaryDark: '#e55a2b',
      secondary: '#3ddc84',
      secondaryLight: '#5fe89f',
      secondaryDark: '#2ca868',
      background: '#0f0f1a',
      surface: '#1a1a2e',
      surfaceLight: '#252540',
      surfaceDark: '#12121f',
      text: '#ffffff',
      textSecondary: '#b0b0c0',
      textMuted: '#707080',
      border: 'rgba(255, 255, 255, 0.1)',
      success: '#3ddc84',
      warning: '#fbbf24',
      error: '#ef4444',
    },
  },
  light: {
    name: '纯净白',
    id: 'light',
    description: '清新明亮的白色主题',
    preview: 'bg-gradient-to-br from-white via-gray-50 to-blue-50',
    colors: {
      primary: '#ff6b35',
      primaryLight: '#ff8f66',
      primaryDark: '#e55a2b',
      secondary: '#3b82f6',
      secondaryLight: '#60a5fa',
      secondaryDark: '#2563eb',
      background: '#f8fafc',
      surface: '#ffffff',
      surfaceLight: '#f1f5f9',
      surfaceDark: '#e2e8f0',
      text: '#1f2937',
      textSecondary: '#4b5563',
      textMuted: '#9ca3af',
      border: 'rgba(0, 0, 0, 0.1)',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
  },
  ocean: {
    name: '海洋蓝',
    id: 'ocean',
    description: '清新自然的海洋配色',
    preview: 'bg-gradient-to-br from-blue-900 via-cyan-900 to-blue-900',
    colors: {
      primary: '#06b6d4',
      primaryLight: '#22d3ee',
      primaryDark: '#0891b2',
      secondary: '#22d3ee',
      secondaryLight: '#67e8f9',
      secondaryDark: '#06b6d4',
      background: '#0c1929',
      surface: '#1e3a5f',
      surfaceLight: '#2d4a6f',
      surfaceDark: '#0f2847',
      text: '#e0f2fe',
      textSecondary: '#7dd3fc',
      textMuted: '#38bdf8',
      border: 'rgba(6, 182, 212, 0.3)',
      success: '#10b981',
      warning: '#fbbf24',
      error: '#ef4444',
    },
  },
  forest: {
    name: '森林绿',
    id: 'forest',
    description: '自然舒适的绿色主题',
    preview: 'bg-gradient-to-br from-green-900 via-emerald-900 to-green-900',
    colors: {
      primary: '#10b981',
      primaryLight: '#34d399',
      primaryDark: '#059669',
      secondary: '#fbbf24',
      secondaryLight: '#fcd34d',
      secondaryDark: '#f59e0b',
      background: '#022c22',
      surface: '#064e3b',
      surfaceLight: '#065f46',
      surfaceDark: '#022c22',
      text: '#d1fae5',
      textSecondary: '#6ee7b7',
      textMuted: '#34d399',
      border: 'rgba(16, 185, 129, 0.3)',
      success: '#34d399',
      warning: '#fcd34d',
      error: '#f87171',
    },
  },
  sunset: {
    name: '晚霞橙',
    id: 'sunset',
    description: '温暖浪漫的橙红配色',
    preview: 'bg-gradient-to-br from-orange-900 via-pink-900 to-orange-900',
    colors: {
      primary: '#f97316',
      primaryLight: '#fb923c',
      primaryDark: '#ea580c',
      secondary: '#ec4899',
      secondaryLight: '#f472b6',
      secondaryDark: '#db2777',
      background: '#1c1418',
      surface: '#2d1f26',
      surfaceLight: '#3d2936',
      surfaceDark: '#1c1418',
      text: '#fce7f3',
      textSecondary: '#fda4af',
      textMuted: '#fb7185',
      border: 'rgba(249, 115, 22, 0.3)',
      success: '#10b981',
      warning: '#fbbf24',
      error: '#ef4444',
    },
  },
};

export function getCurrentTheme(): ThemeName {
  return (localStorage.getItem('app_theme') as ThemeName) || 'dark';
}

export function setTheme(themeId: ThemeName): void {
  localStorage.setItem('app_theme', themeId);
  applyTheme(themeId);
}

export function applyTheme(themeId: ThemeName): void {
  const theme = themes[themeId];
  if (!theme) return;

  const root = document.documentElement;
  const { colors } = theme;

  // 设置主色调
  root.style.setProperty('--primary', colors.primary);
  root.style.setProperty('--primary-light', colors.primaryLight);
  root.style.setProperty('--primary-dark', colors.primaryDark);
  
  // 设置次要色
  root.style.setProperty('--secondary', colors.secondary);
  root.style.setProperty('--secondary-light', colors.secondaryLight);
  root.style.setProperty('--secondary-dark', colors.secondaryDark);
  
  // 设置背景色
  root.style.setProperty('--background', colors.background);
  root.style.setProperty('--surface', colors.surface);
  root.style.setProperty('--surface-light', colors.surfaceLight);
  root.style.setProperty('--surface-dark', colors.surfaceDark);
  
  // 设置文字色
  root.style.setProperty('--text', colors.text);
  root.style.setProperty('--text-secondary', colors.textSecondary);
  root.style.setProperty('--text-muted', colors.textMuted);
  
  // 设置边框和状态色
  root.style.setProperty('--border', colors.border);
  root.style.setProperty('--success', colors.success);
  root.style.setProperty('--warning', colors.warning);
  root.style.setProperty('--error', colors.error);
  
  // 设置 data-theme 属性
  root.setAttribute('data-theme', themeId);
  
  // 更新 body 背景色
  document.body.style.backgroundColor = colors.background;
  
  // 更新主要文本颜色
  document.body.style.color = colors.text;
}

// CSS 变量使用说明:
// 在组件中使用: style={{ color: 'var(--primary)' }}
// 或在CSS中使用: color: var(--text);
