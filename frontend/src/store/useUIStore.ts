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
  // 초기 상태
  isDarkMode: false, // MainEditorApp 내부의 useEffect에서 로컬 스토리지에 따라 업데이트 됨
  isSidebarOpen: true,
  isToolbarOpen: true,
  themePalette: 'vs-dark',
  sidebarWidth: 300,
  sidebarTab: 'explorer',

  // 액션
  setIsDarkMode: (val) => set((state) => ({ 
    isDarkMode: typeof val === 'function' ? val(state.isDarkMode) : val 
  })),
  setIsSidebarOpen: (val) => set((state) => ({ 
    isSidebarOpen: typeof val === 'function' ? val(state.isSidebarOpen) : val 
  })),
  setIsToolbarOpen: (val) => set((state) => ({ 
    isToolbarOpen: typeof val === 'function' ? val(state.isToolbarOpen) : val 
  })),
  setThemePalette: (val) => set({ themePalette: val }),
  setSidebarWidth: (val) => set((state) => ({ 
    sidebarWidth: typeof val === 'function' ? val(state.sidebarWidth) : val 
  })),
  setSidebarTab: (val) => set({ sidebarTab: val }),
}));
