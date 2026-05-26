"use client";

import React, { createContext, useContext } from 'react';
import { showToast } from '@/utils/toast';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 💡 [ ToastProvider 정밀 리팩토링 ]
  // 기존의 꼬이기 쉬운 리액트 상태 JSX 코드를 아예 모두 삭제하여 순도를 높이고,
  // 공통 전역 알림 유틸리티(showToast)를 콘텍스트를 통해 호환 연동합니다.
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
    </ToastContext.Provider>
  );
};
