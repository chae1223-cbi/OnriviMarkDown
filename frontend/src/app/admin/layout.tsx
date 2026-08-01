'use client';

import React, { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, MonitorPlay, Settings, LogOut, Menu, X, MessageSquare, ShieldAlert, Ticket, Files, FileDown, Server, ShieldCheck } from 'lucide-react';
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
    <div className="admin-theme flex h-screen overflow-hidden font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden w-[280px] admin-glass-panel md:flex md:flex-col z-10 transition-all">
        <div className="flex items-center justify-center h-20 border-b border-[var(--admin-border)] px-6 shrink-0">
          <Link href="/admin" className="flex items-center gap-2">
            <img src="/icon.png" alt="Onrivi" className="w-8 h-8 rounded-lg" />
            <span className="text-xl font-extrabold text-[var(--admin-primary)] tracking-tight font-montserrat">
              Onrivi Admin
            </span>
          </Link>
        </div>
        <div className="flex flex-col flex-1 overflow-y-auto px-4 py-8 space-y-2">
          {navigation.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 relative group overflow-hidden ${
                  isActive
                    ? 'text-[var(--admin-primary)] font-semibold bg-[var(--admin-surface-bright)]'
                    : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-surface)]'
                }`}
              >
                {isActive && (
                   <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[var(--admin-primary)] rounded-r-full shadow-[0_0_8px_var(--admin-primary)]" />
                )}
                <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-[var(--admin-primary)]' : ''}`} />
                {item.name}
              </Link>
            );
          })}
        </div>
        <div className="p-4 border-t border-[var(--admin-border)] shrink-0 space-y-3">
          {/* Admin Info Card */}
          {adminEmail && (
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-[var(--admin-surface)] border border-[var(--admin-border)]">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--admin-primary)] to-[#6d28d9] flex items-center justify-center text-white text-sm font-bold shrink-0">
                {adminEmail.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-[var(--admin-text)] truncate" title={adminEmail}>
                  {adminEmail}
                </p>
                <span className={`inline-flex items-center mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                  adminRole === 'SUPER'
                    ? 'bg-[rgba(155,89,182,0.15)] text-[#c084fc]'
                    : 'bg-[rgba(52,152,219,0.15)] text-[var(--admin-primary)]'
                }`}>
                  {adminRole === 'SUPER' ? '⚡ SUPER' : '🛡 SUPPORT'}
                </span>
              </div>
            </div>
          )}
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-4 py-2.5 w-full rounded-xl text-[var(--admin-text-muted)] hover:bg-[rgba(105,0,5,0.2)] hover:text-[var(--admin-error)] transition-all duration-200 font-medium text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>로그아웃</span>
          </button>
        </div>
      </aside>

      {/* Session Extension Modal */}
      {showExtensionPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="admin-glass-card p-8 max-w-md w-full mx-4 animate-in zoom-in-95 duration-300 border-[var(--admin-border)]">
            <h2 className="text-2xl font-bold text-[var(--admin-text)] mb-4">로그인 연장 안내</h2>
            <p className="text-[var(--admin-text-muted)] mb-6 leading-relaxed">
              보안을 위해 1시간마다 로그인 상태를 확인합니다.<br/>
              세션을 1시간 연장하시겠습니까?
            </p>
            <div className="flex flex-col gap-2 mb-6">
              <span className="text-sm text-[var(--admin-error)] font-medium animate-pulse">
                자동 로그아웃까지 남은 시간: {Math.floor(extensionTimeLeft / 60)}분 {(extensionTimeLeft % 60).toString().padStart(2, '0')}초
              </span>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleLogout}
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-[var(--admin-text-muted)] bg-[var(--admin-surface)] hover:bg-[var(--admin-surface-bright)] transition-colors"
              >
                로그아웃
              </button>
              <button 
                onClick={handleExtendSession}
                className="flex-1 py-3 px-4 admin-btn-primary"
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
        <header className="md:hidden flex items-center justify-between h-20 px-6 admin-glass-panel z-20 shrink-0 border-b">
          <Link href="/admin" className="flex items-center gap-2">
            <img src="/icon.png" alt="Onrivi" className="w-8 h-8 rounded-lg" />
            <span className="text-lg font-extrabold text-[var(--admin-primary)] font-montserrat">
              Onrivi Admin
            </span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface)] rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)}>
            <aside
              className="absolute top-20 left-0 bottom-0 w-[280px] admin-glass-panel flex flex-col shadow-xl animate-in slide-in-from-left-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col flex-1 overflow-y-auto px-4 py-8 space-y-2">
                {navigation.map((item) => {
                   const isActive = currentTab === item.id;
                   return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 relative overflow-hidden ${
                      isActive
                        ? 'text-[var(--admin-primary)] font-semibold bg-[var(--admin-surface-bright)]'
                        : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-surface)]'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[var(--admin-primary)] rounded-r-full shadow-[0_0_8px_var(--admin-primary)]" />
                    )}
                    <item.icon className="w-5 h-5" />
                    {item.name}
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
