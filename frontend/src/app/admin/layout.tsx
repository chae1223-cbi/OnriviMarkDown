'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, MonitorPlay, Settings, LogOut, Menu, X } from 'lucide-react';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const currentTab = searchParams.get('tab') || 'dashboard';

  const navigation = [
    { name: '대시보드', href: '/admin?tab=dashboard', id: 'dashboard', icon: LayoutDashboard },
    { name: '사용자 관리', href: '/admin?tab=users', id: 'users', icon: Users },
    { name: '구독 및 라이선스', href: '/admin?tab=subscriptions', id: 'subscriptions', icon: CreditCard },
    { name: '공통 코드 관리', href: '/admin?tab=codes', id: 'codes', icon: Settings },
  ];

  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] font-sans">{children}</div>;
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#0F172A] overflow-hidden font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden w-64 bg-white dark:bg-[#1E293B] border-r border-neutral-200 dark:border-neutral-800 md:flex md:flex-col shadow-sm z-10 transition-all">
        <div className="flex items-center justify-center h-16 border-b border-neutral-200 dark:border-neutral-800 px-6 shrink-0">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Onrivi Admin
            </span>
          </Link>
        </div>
        <div className="flex flex-col flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 relative group overflow-hidden ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-semibold shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {isActive && (
                   <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 dark:bg-blue-400 rounded-r-full shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
                )}
                <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                {item.name}
              </Link>
            );
          })}
        </div>
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 shrink-0">
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 w-full rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all duration-200 font-medium">
            <LogOut className="w-4 h-4" />
            <span>로그아웃</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between h-16 px-4 bg-white dark:bg-[#1E293B] border-b border-neutral-200 dark:border-neutral-800 z-20 shrink-0">
          <Link href="/admin" className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Onrivi Admin
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)}>
            <aside
              className="absolute top-16 left-0 bottom-0 w-64 bg-white dark:bg-[#1E293B] border-r border-neutral-200 dark:border-neutral-800 flex flex-col shadow-xl animate-in slide-in-from-left-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col flex-1 overflow-y-auto px-4 py-6 space-y-2">
                {navigation.map((item) => {
                   const isActive = currentTab === item.id;
                   return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-semibold'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                )})}
              </div>
            </aside>
          </div>
        )}

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#F8FAFC] dark:bg-[#0F172A] scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex items-center justify-center">Loading...</div>}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}
