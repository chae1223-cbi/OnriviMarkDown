/**
 * 프로그램명 : OnriviAuthor
 * 파일명 : app/admin/layout.tsx
 * -----------------------------------------------------------------------
 * 변경내역
 * -----------------------------------------------------------------------
 * 🚨 @PATCH : **2026-09-02** — 좌측 상단 헤더 로고(/icon.png) 및 'Onrivi Admin' 타이포그래피를 랜딩페이지 브랜드 디자인 시스템 규격과 100% 일치화
 *             **2026-09-02** — LINE Design System (LDSG v5.0) 표준 적용: 사이드바 .bg-sidebar-luxury 럭셔리 그라데이션 적용 및 LDSG Green(#06C755)/Blue(#4D73FF) 컬러 시스템 통일
 * -----------------------------------------------------------------------
 */
'use client';

import React, { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, MonitorPlay, Settings, LogOut, Menu, X, MessageSquare, ShieldAlert, Ticket, Files, FileDown, Server, ShieldCheck, Tags } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { showToast } from '@/utils/toast';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [adminRole, setAdminRole] = useState<string>('');
  const [adminEmail, setAdminEmail] = useState<string>('');
  const currentTab = searchParams.get('tab') || 'dashboard';

  useEffect(() => {
    if (pathname === '/admin/login') return;
    
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/admin/login');
        return;
      }

      const { data: adminData } = await supabase.from('admins').select('admin_role').eq('user_id', session.user.id).single();
      if (!adminData) {
        // admins 테이블에서 해당 유저 레코드가 없으면 권한 없음 → 즉시 로그아웃 후 로그인 화면으로
        await supabase.auth.signOut();
        router.replace('/admin/login');
        return;
      }
      setAdminRole(adminData.admin_role);
      setAdminEmail(session.user.email || '');
      
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.currentLevel !== 'aal2') {
        router.replace('/admin/login');
      }
    };
    
    checkAuth();
  }, [pathname, router]);

  // --- Session Extension ---
  const [showExtensionPrompt, setShowExtensionPrompt] = useState(false);
  const [extensionTimeLeft, setExtensionTimeLeft] = useState(120);

  useEffect(() => {
    if (pathname === '/admin/login') return;

    let sessionTimer: NodeJS.Timeout;
    let extensionInterval: NodeJS.Timeout;

    if (!showExtensionPrompt) {
      // 1시간 타이머 시작
      sessionTimer = setTimeout(() => {
        setShowExtensionPrompt(true);
        setExtensionTimeLeft(120);
      }, 3600000); // 1시간 (3600000ms)
    } else {
      // 2분 카운트다운 시작
      extensionInterval = setInterval(() => {
        setExtensionTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(extensionInterval);
            (async () => {
              showToast('보안을 위해 세션이 만료되어 자동 로그아웃 되었습니다.', 'warning');
              await supabase.auth.signOut();
              router.replace('/admin/login');
              setShowExtensionPrompt(false);
            })();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (sessionTimer) clearTimeout(sessionTimer);
      if (extensionInterval) clearInterval(extensionInterval);
    };
  }, [pathname, router, showExtensionPrompt]);

  const handleExtendSession = () => {
    setShowExtensionPrompt(false);
    showToast('로그인 세션이 1시간 연장되었습니다.', 'success');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const navigation = [
    { name: '대시보드', href: '/admin?tab=dashboard', id: 'dashboard', icon: LayoutDashboard },
    { name: '사용자 관리', href: '/admin?tab=users', id: 'users', icon: Users },
    { name: '구독 및 라이선스', href: '/admin?tab=subscriptions', id: 'subscriptions', icon: CreditCard },
    { name: '요금제 관리', href: '/admin?tab=plans', id: 'plans', icon: Tags },
    { name: '자주 묻는 질문', href: '/admin?tab=faqs', id: 'faqs', icon: MessageSquare },
    ...(adminRole === 'SUPER' ? [{ name: '관리자 계정 관리', href: '/admin?tab=admins', id: 'admins', icon: ShieldCheck }] : []),
    { name: '문의 및 지원', href: '/admin?tab=support', id: 'support', icon: MessageSquare },
    { name: '공통 코드 관리', href: '/admin?tab=codes', id: 'codes', icon: Settings },
    { name: '감사 로그', href: '/admin?tab=audit', id: 'audit', icon: ShieldAlert },
    { name: '프로모션 관리', href: '/admin?tab=promotions', id: 'promotions', icon: Ticket },
    { name: '콘텐츠 관리', href: '/admin?tab=contents', id: 'contents', icon: Files },
    { name: '리포트 추출', href: '/admin?tab=reports', id: 'reports', icon: FileDown },
    { name: '시스템 현황', href: '/admin?tab=system', id: 'system', icon: Server },
  ];

  if (pathname === '/admin/login') {
    return <div className="admin-theme min-h-screen font-sans">{children}</div>;
  }

  return (
    <div className="admin-theme flex h-screen overflow-hidden font-sans bg-[#F8F9FA]">
      {/* Sidebar for Desktop (.bg-sidebar-luxury 표준) */}
      <aside className="hidden w-[280px] bg-sidebar-luxury border-r border-[#EFEFEF] md:flex md:flex-col z-10 transition-all">
        <div className="flex items-center justify-start gap-3 h-20 border-b border-[#EFEFEF] px-6 shrink-0">
          <Link href="/admin" className="flex items-center gap-2.5">
            <img src="/icon.png" alt="Onrivi" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-lg text-zinc-900 tracking-tight">
              Onrivi Admin
            </span>
          </Link>
        </div>
        <div className="flex flex-col flex-1 overflow-y-auto px-4 py-6 space-y-1.5 custom-scrollbar">
          {navigation.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 relative group overflow-hidden ${
                  isActive
                    ? 'text-[#06C755] font-bold bg-[#06C755]/10 shadow-sm'
                    : 'text-zinc-700 hover:text-zinc-950 hover:bg-black/5 font-bold'
                }`}
              >
                {isActive && (
                   <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#06C755] rounded-r-full shadow-[0_0_8px_#06C755]" />
                )}
                <item.icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-[#06C755]' : 'text-zinc-600'}`} />
                <span className="text-[13.5px] tracking-tight">{item.name}</span>
              </Link>
            );
          })}
        </div>
        <div className="p-4 border-t border-[#EFEFEF] shrink-0 space-y-3">
          {/* Admin Info Card */}
          {adminEmail && (
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white border border-[#EFEFEF] shadow-sm">
              <div className="w-9 h-9 rounded-full bg-[#06C755] flex items-center justify-center text-white text-sm font-bold shrink-0">
                {adminEmail.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-zinc-800 truncate" title={adminEmail}>
                  {adminEmail}
                </p>
                <span className={`inline-flex items-center mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                  adminRole === 'SUPER'
                    ? 'bg-[#06C755]/10 text-[#06C755]'
                    : 'bg-[#4D73FF]/10 text-[#4D73FF]'
                }`}>
                  {adminRole === 'SUPER' ? '⚡ SUPER' : '🛡 SUPPORT'}
                </span>
              </div>
            </div>
          )}
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-4 py-2.5 w-full rounded-xl text-zinc-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 font-semibold text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>로그아웃</span>
          </button>
        </div>
      </aside>

      {/* Session Extension Modal */}
      {showExtensionPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="admin-glass-card p-8 max-w-md w-full mx-4 animate-in zoom-in-95 duration-300 border-[#EFEFEF] bg-white shadow-xl">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">로그인 연장 안내</h2>
            <p className="text-zinc-600 mb-6 leading-relaxed text-sm">
              보안을 위해 1시간마다 로그인 상태를 확인합니다.<br/>
              세션을 1시간 연장하시겠습니까?
            </p>
            <div className="flex flex-col gap-2 mb-6">
              <span className="text-sm text-red-600 font-semibold animate-pulse">
                자동 로그아웃까지 남은 시간: {Math.floor(extensionTimeLeft / 60)}분 {(extensionTimeLeft % 60).toString().padStart(2, '0')}초
              </span>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleLogout}
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-colors text-sm"
              >
                로그아웃
              </button>
              <button 
                onClick={handleExtendSession}
                className="flex-1 py-3 px-4 admin-btn-primary text-sm"
              >
                1시간 연장하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between h-16 px-6 bg-white border-b border-[#EFEFEF] z-20 shrink-0">
          <Link href="/admin" className="flex items-center gap-2.5">
            <img src="/icon.png" alt="Onrivi" className="w-7 h-7 rounded-lg" />
            <span className="font-bold text-base text-zinc-900 tracking-tight">
              Onrivi Admin
            </span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-black/5 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)}>
            <aside
              className="absolute top-16 left-0 bottom-0 w-[280px] bg-sidebar-luxury border-r border-[#EFEFEF] flex flex-col shadow-2xl animate-in slide-in-from-left-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col flex-1 overflow-y-auto px-4 py-6 space-y-1.5 custom-scrollbar">
                {navigation.map((item) => {
                   const isActive = currentTab === item.id;
                   return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 relative overflow-hidden ${
                      isActive
                        ? 'text-[#06C755] font-bold bg-[#06C755]/10 shadow-sm'
                        : 'text-zinc-700 hover:text-zinc-950 hover:bg-black/5 font-bold'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#06C755] rounded-r-full shadow-[0_0_8px_#06C755]" />
                    )}
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-[#06C755]' : 'text-zinc-600'}`} />
                    <span className="text-[13.5px] tracking-tight">{item.name}</span>
                  </Link>
                )})}
              </div>
            </aside>
          </div>
        )}

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-theme">
      <Suspense fallback={<div className="min-h-screen bg-[var(--admin-bg)] flex items-center justify-center">Loading...</div>}>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </Suspense>
    </div>
  );
}
