import { useState, useEffect } from 'react';

export const MOBILE_BREAKPOINT = 768;
export const TABLET_BREAKPOINT = 1024;

export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < MOBILE_BREAKPOINT;
};

export const isTablet = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= MOBILE_BREAKPOINT && window.innerWidth < TABLET_BREAKPOINT;
};

export const isDesktop = (): boolean => {
  if (typeof window === 'undefined') return true;
  return window.innerWidth >= TABLET_BREAKPOINT;
};

export type ViewMode = 'mobile' | 'tablet' | 'desktop';

export const getViewMode = (): ViewMode => {
  if (isMobile()) return 'mobile';
  if (isTablet()) return 'tablet';
  return 'desktop';
};

export const useViewMode = (): ViewMode => {
  const [viewMode, setViewMode] = useState<ViewMode>(getViewMode());

  useEffect(() => {
    const handleResize = () => {
      setViewMode(getViewMode());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewMode;
};

export const useResponsive = () => {
  const viewMode = useViewMode();
  
  return {
    viewMode,
    isMobile: viewMode === 'mobile',
    isTablet: viewMode === 'tablet',
    isDesktop: viewMode === 'desktop',
  };
};
