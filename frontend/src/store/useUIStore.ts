import { create } from 'zustand';

interface UIState {
  // 상태 변수
  isDarkMode: boolean;
  isSidebarOpen: boolean;
  isToolbarOpen: boolean;
  themePalette: string;
  sidebarWidth: number;
  sidebarTab: 'explorer' | 'search' | 'toc';

  // Setter 함수
  setIsDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  setIsSidebarOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  setIsToolbarOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  setThemePalette: (val: string) => void;
  setSidebarWidth: (val: number | ((prev: number) => number)) => void;
  setSidebarTab: (val: 'explorer' | 'search' | 'toc') => void;
}

export const useUIStore = create<UIState>((set) => ({
  // 초기 상태 - 로컬 스토리지에서 마지막으로 설정된 상태 복원
  isDarkMode: false,
  isSidebarOpen: typeof window !== 'undefined' ? localStorage.getItem('onrivi_sidebar_open') !== 'false' : true,
  isToolbarOpen: typeof window !== 'undefined' ? localStorage.getItem('onrivi_toolbar_open') !== 'false' : true,
  themePalette: 'vs-dark',
  sidebarWidth: 300,
  sidebarTab: 'explorer',

  // 액션 - 설정 시 로컬 스토리지에 즉시 동기화
  setIsDarkMode: (val) => set((state) => ({ 
    isDarkMode: typeof val === 'function' ? val(state.isDarkMode) : val 
  })),
  setIsSidebarOpen: (val) => set((state) => {
    const nextVal = typeof val === 'function' ? val(state.isSidebarOpen) : val;
    if (typeof window !== 'undefined') {
      localStorage.setItem('onrivi_sidebar_open', String(nextVal));
    }
    return { isSidebarOpen: nextVal };
  }),
  setIsToolbarOpen: (val) => set((state) => {
    const nextVal = typeof val === 'function' ? val(state.isToolbarOpen) : val;
    if (typeof window !== 'undefined') {
      localStorage.setItem('onrivi_toolbar_open', String(nextVal));
    }
    return { isToolbarOpen: nextVal };
  }),
  setThemePalette: (val) => set({ themePalette: val }),
  setSidebarWidth: (val) => set((state) => ({ 
    sidebarWidth: typeof val === 'function' ? val(state.sidebarWidth) : val 
  })),
  setSidebarTab: (val) => set({ sidebarTab: val }),
}));
