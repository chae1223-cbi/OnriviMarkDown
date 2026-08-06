'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Users, TrendingUp, CreditCard, Activity, Search, MoreVertical, Plus, ShieldOff, MessageSquare, CheckCircle2, Construction, X } from 'lucide-react';
import { showToast } from '@/utils/toast';
import { supabase } from '@/lib/supabaseClient';
import UserDetailModal from './components/UserDetailModal';
import AdminsTab from './components/AdminsTab';
import CodesTab from './components/CodesTab';
import PlansTab from './components/PlansTab';
import OTPResetModal from './components/OTPResetModal';
import InquiriesTab from './components/InquiriesTab';

function AdminPageContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'dashboard';

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {tab === 'dashboard' && <DashboardTab />}
      {tab === 'users' && <UsersTab />}
      {tab === 'admins' && <AdminsTab />}
      {tab === 'subscriptions' && <SubscriptionsTab />}
      {tab === 'codes' && <CodesTab />}
      {tab === 'plans' && <PlansTab />}
      {tab === 'support' && <InquiriesTab />}
      {tab === 'audit' && <FutureFeatureTab title="감사 로그" features={['누가, 언제, 어떤 고객의 데이터를 건드렸는지 행동 기록 추적', '내부 직원의 실수나 어뷰징 방지 및 보안 강화']} />}
      {tab === 'promotions' && <FutureFeatureTab title="프로모션 관리" features={['할인 쿠폰 또는 무료 이용권(Free Trial) 코드 생성', '마케팅 이벤트 성과 분석 및 발급된 쿠폰 사용 내역 추적']} />}
      {tab === 'contents' && <FutureFeatureTab title="콘텐츠 관리" features={['사용자들이 업로드한 이미지 및 파일 첨부 내역 조회', '불법 콘텐츠 필터링 및 불필요한 대용량 파일 강제 삭제(서버 용량 관리)']} />}
      {tab === 'reports' && <FutureFeatureTab title="리포트 추출" features={['특정 기간 동안의 결제 내역 및 가입자 목록 조회', '세금 신고 및 투자자 보고용 엑셀(CSV) 파일 다운로드']} />}
      {tab === 'system' && <FutureFeatureTab title="시스템 현황" features={['현재 DB 용량 및 백업 상태 실시간 모니터링', '자동 결제 실패 등 중요 알림에 대한 슬랙(Slack) 웹훅 알림 설정']} />}
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminPageContent />
    </Suspense>
  );
}

function DashboardTab() {
  const stats = [
    { title: '총 가입자', value: '1,248', change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { title: '활성 구독(MRR)', value: '₩4,250,000', change: '+8.2%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { title: '오늘의 신규 결제', value: '24건', change: '+4건', icon: CreditCard, color: 'text-violet-600', bg: 'bg-violet-100 dark:bg-violet-900/30' },
    { title: '동시 접속 세션', value: '342', change: '안정적', icon: Activity, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[32px] font-semibold text-[var(--admin-text)] tracking-tight font-montserrat">대시보드</h1>
        <p className="text-[var(--admin-text-muted)] mt-1">Onrivi 서비스의 전반적인 현황을 확인합니다.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="admin-glass-card p-6 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium admin-chip-emerald px-2.5 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
            <h3 className="text-[var(--admin-text-muted)] font-medium text-sm">{stat.title}</h3>
            <p className="text-[32px] font-bold font-montserrat text-[var(--admin-text)] mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mock Chart Area */}
        <div className="lg:col-span-2 admin-glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[var(--admin-text)]">주간 접속 트렌드</h2>
            <button className="text-sm text-[var(--admin-primary)] font-medium hover:underline">상세보기</button>
          </div>
          <div className="h-64 flex items-end justify-between gap-2 border-b border-[var(--admin-border)] pb-4">
            {[40, 70, 45, 90, 65, 85, 110].map((h, i) => (
              <div key={i} className="w-full bg-[var(--admin-primary)]/20 hover:bg-[var(--admin-primary)]/40 rounded-t-md transition-colors relative group" style={{ height: `${h}%` }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--admin-surface)] text-[var(--admin-text)] text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {h * 12}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="admin-glass-card p-6">
          <h2 className="text-lg font-bold text-[var(--admin-text)] mb-6">최근 가입자</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-2 hover:bg-[var(--admin-surface)] rounded-xl transition-colors">
                <div className="w-10 h-10 rounded-full bg-[var(--admin-surface-bright)] border border-[var(--admin-border)] flex items-center justify-center text-[var(--admin-text)] font-medium">
                  U{i}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--admin-text)] truncate">user{i}@example.com</p>
                  <p className="text-xs text-[var(--admin-text-muted)]">방금 전 가입 (무료 체험)</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function UsersTab() {
  const [resettingEmail, setResettingEmail] = useState<string | null>(null);
  const [userType, setUserType] = useState<'general' | 'admin'>('general');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<any | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [detailTarget, setDetailTarget] = useState<any | null>(null);
  const [paymentHistoryTarget, setPaymentHistoryTarget] = useState<any | null>(null);
  const [auditTarget, setAuditTarget] = useState<any | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const [confirmConfig, setConfirmConfig] = useState<{isOpen: boolean, title: string, onConfirm: () => void} | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPlan, setFilterPlan] = useState<string>('ALL');

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/users?type=${userType}&page=${page}&limit=10&status=${filterStatus}&plan=${filterPlan}`);
        const json = await res.json();
        if (json.success) {
          setUsers(json.data);
          setTotal(json.total);
        } else {
          showToast('데이터를 불러오지 못했습니다.', 'error');
        }
      } catch (err) {
        showToast('네트워크 오류가 발생했습니다.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [userType, page, filterStatus, filterPlan, refreshKey]);

  const handleResetOTP = (email: string) => {
    setResettingEmail(email);
  };

  const confirmOTPReset = async () => {
    if (!resettingEmail) return;
    try {
      const response = await fetch('/api/admin/mfa/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resettingEmail })
      });
      
      const data = await response.json();
      if (response.ok) {
        showToast(data.message || 'OTP가 성공적으로 초기화되었습니다.', 'success');
      } else {
        showToast(data.error || '초기화 중 오류가 발생했습니다.', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('서버와의 통신 중 오류가 발생했습니다.', 'error');
    } finally {
      setResettingEmail(null);
    }
  };

  const handleKillSession = (user: any) => {
    setConfirmConfig({
      isOpen: true,
      title: `${user.email} 사용자의 모든 세션을 강제 종료하시겠습니까?`,
      onConfirm: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const adminId = session?.user?.id;

          const res = await fetch('/api/admin/users', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'kill_session', userId: user.id, adminId })
          });
          const data = await res.json();
          if (data.success) {
            showToast('사용자의 세션이 성공적으로 강제 종료되었습니다.', 'success');
            setPage(1);
            setRefreshKey(prev => prev + 1);
          } else {
            showToast('세션 종료 처리에 실패했습니다.', 'error');
          }
        } catch (err) {
          showToast('네트워크 오류가 발생했습니다.', 'error');
        } finally {
          setConfirmConfig(null);
        }
      }
    });
  };

  const handleKillSingleSession = (user: any, deviceId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: `해당 세션을 강제 종료하시겠습니까?`,
      onConfirm: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const adminId = session?.user?.id;

          const res = await fetch('/api/admin/users', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'kill_single_session', userId: user.id, adminId, deviceId })
          });
          const data = await res.json();
          if (data.success) {
            showToast('선택한 세션이 강제 종료되었습니다.', 'success');
            setPage(1);
            setRefreshKey(prev => prev + 1);
          } else {
            showToast('세션 종료 처리에 실패했습니다.', 'error');
          }
        } catch (err) {
          showToast('네트워크 오류가 발생했습니다.', 'error');
        } finally {
          setConfirmConfig(null);
        }
      }
    });
  };

  const submitSuspend = async () => {
    if (!suspendTarget || !suspendReason.trim()) {
      showToast('정지 사유를 입력해주세요.', 'error');
      return;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const adminId = session?.user?.id;

      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'suspend', userId: suspendTarget.id, reason: suspendReason, adminId })
      });
      const data = await res.json();
      if (data.success) {
        showToast('계정이 성공적으로 정지 처리되었습니다.', 'success');
        setSuspendTarget(null);
        setSuspendReason('');
        setPage(1);
        setRefreshKey(prev => prev + 1);
      } else {
        showToast('정지 처리에 실패했습니다.', 'error');
      }
    } catch (err) {
      showToast('네트워크 오류가 발생했습니다.', 'error');
    }
  };

  const handleUnban = (user: any) => {
    setConfirmConfig({
      isOpen: true,
      title: `${user.email} 사용자의 계정 정지를 해제하시겠습니까?`,
      onConfirm: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const adminId = session?.user?.id;

          const res = await fetch('/api/admin/users', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'unban', userId: user.id, adminId })
          });
          const data = await res.json();
          if (data.success) {
            showToast('계정 정지가 성공적으로 해제되었습니다.', 'success');
            setPage(1);
            setRefreshKey(prev => prev + 1);
          } else {
            showToast('정지 해제 처리에 실패했습니다.', 'error');
          }
        } catch (err) {
          showToast('네트워크 오류가 발생했습니다.', 'error');
        } finally {
          setConfirmConfig(null);
        }
      }
    });
  };

  const handleOpenAudit = async (user: any) => {
    setAuditTarget(user);
    setLoadingAudit(true);
    setOpenMenuId(null);
    try {
      const res = await fetch(`/api/admin/audit-logs?userId=${user.id}`);
      const json = await res.json();
      if (json.success) {
        setAuditLogs(json.data);
      } else {
        showToast('탈퇴/정지 이력을 불러오지 못했습니다.', 'error');
        setAuditLogs([]);
      }
    } catch (err) {
      showToast('네트워크 오류가 발생했습니다.', 'error');
      setAuditLogs([]);
    } finally {
      setLoadingAudit(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-semibold text-[var(--admin-text)] tracking-tight font-montserrat">사용자 관리</h1>
          <p className="text-[var(--admin-text-muted)] mt-1">가입된 회원 목록을 조회하고 계정을 제어합니다.</p>
        </div>
        <div className="flex gap-2">
        </div>
      </div>

      <div className="admin-glass-card shadow-sm overflow-hidden">
        <div className="flex border-b border-[var(--admin-border)]">
          <button 
            onClick={() => { setUserType('general'); setPage(1); setFilterStatus('ALL'); setFilterPlan('ALL'); }}
            className={`flex-1 py-4 px-4 text-sm font-medium border-b-2 transition-colors ${userType === 'general' ? 'border-[var(--admin-primary)] text-[var(--admin-primary)]' : 'border-transparent text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]'}`}
          >
            일반 사용자
          </button>
          <button 
            onClick={() => { setUserType('admin'); setPage(1); setFilterStatus('ALL'); setFilterPlan('ALL'); }}
            className={`flex-1 py-4 px-4 text-sm font-medium border-b-2 transition-colors ${userType === 'admin' ? 'border-[var(--admin-primary)] text-[var(--admin-primary)]' : 'border-transparent text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]'}`}
          >
            관리자
          </button>
        </div>
        <div className="px-6 py-4 border-b border-[var(--admin-border)] flex flex-wrap items-center gap-3">
          {/* 상태 필터 */}
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text)] focus:outline-none focus:border-[var(--admin-primary)] transition-colors"
          >
            <option value="ALL">모든 상태</option>
            <option value="ACTIVE">활성 (Active)</option>
            <option value="SUSPENDED">정지 (Suspended)</option>
          </select>

          {/* 요금제 필터 — 일반 사용자 탭에서만 노출 */}
          {userType === 'general' && (
            <select
              value={filterPlan}
              onChange={(e) => { setFilterPlan(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text)] focus:outline-none focus:border-[var(--admin-primary)] transition-colors"
            >
              <option value="ALL">모든 요금제</option>
              <option value="READER">Reader</option>
              <option value="APPRENTICE">Apprentice</option>
              <option value="REGULAR">Regular</option>
              <option value="ELITEPRO">Elite Pro</option>
            </select>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--admin-border)] text-[var(--admin-text-muted)] text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">사용자 정보</th>
                <th className="px-6 py-4 font-medium">요금제</th>
                <th className="px-6 py-4 font-medium">상태 / 기한</th>
                <th className="px-6 py-4 font-medium">일시 기록</th>
                <th className="px-6 py-4 font-medium text-right">관리</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--admin-text-muted)]">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-[var(--admin-primary)] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm">데이터를 불러오는 중입니다...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--admin-text-muted)] text-sm">
                    등록된 사용자가 없습니다.
                  </td>
                </tr>
              ) : (
                users.map((user, i) => (
                  <tr key={user.id || i} className="hover:bg-[var(--admin-surface)] transition-colors border-b border-[var(--admin-border)] last:border-b-0">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--admin-surface-bright)] border border-[var(--admin-border)] text-[var(--admin-text)] flex items-center justify-center font-bold text-xs uppercase">
                          {user.email?.charAt(0) || 'U'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-[var(--admin-text)] text-sm">{user.email}</span>
                          <span className="text-xs text-[var(--admin-text-muted)] mt-0.5">{user.nick_name || '-'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--admin-surface-bright)] text-[var(--admin-text)] border border-[var(--admin-border)]">
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col items-start gap-1.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.status === 'ACTIVE' || user.status === 'READER' ? 'admin-chip-emerald' : 'admin-chip-error'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'ACTIVE' || user.status === 'READER' ? 'bg-[var(--admin-secondary)]' : 'bg-[var(--admin-error)]'}`}></span>
                          {user.status}
                        </span>
                        {userType === 'general' && user.end_date !== '-' && user.plan !== 'READER' && (
                          <span className="text-[11px] text-[var(--admin-text-muted)]">
                            {user.status === 'ACTIVE' ? '다음 결제:' : '종료/해제:'} {user.end_date}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-[var(--admin-text-muted)]">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between min-w-[140px]">
                          <span className="text-[11px] uppercase opacity-70">가입</span>
                          <span className="text-xs text-[var(--admin-text)]">{user.date}</span>
                        </div>
                        <div className="flex items-center justify-between min-w-[140px]">
                          <span className="text-[11px] uppercase opacity-70">로그인</span>
                          <span className="text-xs text-[var(--admin-text)]">{user.last_login || '-'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {userType === 'admin' && (
                          <button 
                            onClick={() => handleResetOTP(user.email)}
                            disabled={resettingEmail === user.email}
                            className="px-3 py-1.5 text-xs font-medium admin-chip-error rounded-lg hover:bg-[rgba(105,0,5,0.4)] transition-colors flex items-center gap-1 disabled:opacity-50"
                            title="이 관리자의 2단계 인증 기기를 삭제합니다"
                          >
                            <ShieldOff className="w-3.5 h-3.5" />
                            {resettingEmail === user.email ? '초기화 중...' : 'OTP 초기화'}
                          </button>
                        )}
                        <div className="relative">
                          <button 
                            onClick={() => setOpenMenuId(openMenuId === user.email ? null : user.email)}
                            className="p-2 text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-surface)] rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        
                        {openMenuId === user.email && (
                          <div 
                            className="absolute right-0 mt-2 w-48 admin-glass-card border-[var(--admin-border)] shadow-xl z-50 overflow-hidden"
                            onMouseLeave={() => setOpenMenuId(null)}
                          >
                            <div className="py-1">
                              {userType === 'general' ? (
                                <>
                                  <button onClick={() => { setDetailTarget(user); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-[var(--admin-text)] hover:bg-[var(--admin-surface)]">상세 정보 보기</button>
                                  <button onClick={() => { setPaymentHistoryTarget(user); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-[var(--admin-text)] hover:bg-[var(--admin-surface)]">결제 내역 조회</button>
                                  <button onClick={() => handleOpenAudit(user)} className="w-full text-left px-4 py-2 text-sm text-[var(--admin-text)] hover:bg-[var(--admin-surface)]">탈퇴/정지 이력 보기</button>
                                  <div className="border-t border-[var(--admin-border)] my-1"></div>
                                  {user.status === 'SUSPENDED' ? (
                                    <button onClick={() => { handleUnban(user); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-blue-500 hover:bg-[rgba(0,105,255,0.1)]">정지 해제 (Unban)</button>
                                  ) : (
                                    <button onClick={() => { setSuspendTarget(user); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-[var(--admin-error)] hover:bg-[rgba(105,0,5,0.4)]">계정 정지 (Suspend)</button>
                                  )}
                                </>
                              ) : (
                                <>
                                  <button onClick={() => setOpenMenuId(null)} className="w-full text-left px-4 py-2 text-sm text-[var(--admin-text)] hover:bg-[var(--admin-surface)]">권한 변경</button>
                                  <button onClick={() => handleOpenAudit(user)} className="w-full text-left px-4 py-2 text-sm text-[var(--admin-text)] hover:bg-[var(--admin-surface)]">탈퇴/정지 이력 보기</button>
                                  <div className="border-t border-[var(--admin-border)] my-1"></div>
                                  <button onClick={() => setOpenMenuId(null)} className="w-full text-left px-4 py-2 text-sm text-[var(--admin-error)] hover:bg-[rgba(105,0,5,0.4)]">권한 즉각 회수</button>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-6 border-t border-[var(--admin-border)] flex items-center justify-between text-sm text-[var(--admin-text-muted)]">
          <span>총 {total}명 중 {total === 0 ? 0 : (page - 1) * 10 + 1}-{Math.min(page * 10, total)} 보여주는 중</span>
          <div className="flex gap-2 items-center">
            <button 
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded-lg transition-colors border border-[var(--admin-border)] hover:bg-[var(--admin-surface)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.ceil(total / 10) || 1 }).map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 rounded-lg transition-colors ${page === i + 1 ? 'border border-[var(--admin-border)] bg-[var(--admin-surface-bright)] text-[var(--admin-text)]' : 'text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface)]'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setPage(Math.min(Math.ceil(total / 10) || 1, page + 1))}
              disabled={page >= (Math.ceil(total / 10) || 1)}
              className="px-3 py-1 rounded-lg transition-colors border border-[var(--admin-border)] hover:bg-[var(--admin-surface)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        </div>
      </div>

      {/* Suspend Confirmation Modal */}
      {suspendTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="admin-glass-card p-8 max-w-md w-full mx-4 border-[var(--admin-border)]">
            <h2 className="text-xl font-bold text-[var(--admin-text)] mb-4">정말 계정을 정지하시겠습니까?</h2>
            <p className="text-[var(--admin-text-muted)] text-sm mb-4">
              <strong className="text-[var(--admin-primary)]">{suspendTarget.email}</strong> 계정의 모든 이용이 즉각 중단됩니다.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-[var(--admin-text)] mb-2">정지 사유 (필수)</label>
              <textarea 
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                className="w-full h-24 p-3 admin-ghost-input resize-none"
                placeholder="어뷰징, 요금 미납 등 사유를 상세히 적어주세요."
              ></textarea>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => { setSuspendTarget(null); setSuspendReason(''); }}
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-[var(--admin-text-muted)] bg-[var(--admin-surface)] hover:bg-[var(--admin-surface-bright)] transition-colors"
              >
                취소
              </button>
              <button 
                onClick={submitSuspend}
                className="flex-1 py-3 px-4 rounded-xl font-semibold bg-[var(--admin-error)] text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20"
              >
                정지 확정
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      <UserDetailModal 
        user={detailTarget} 
        onClose={() => setDetailTarget(null)} 
        onKillSession={() => {
          handleKillSession(detailTarget);
          setDetailTarget(null);
        }}
        onKillSingleSession={(deviceId) => {
          handleKillSingleSession(detailTarget, deviceId);
          setDetailTarget(null);
        }}
      />
      {/* Payment History Modal */}
      {paymentHistoryTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="admin-glass-card max-w-2xl w-full mx-4 border-[var(--admin-border)]">
            <div className="p-6 border-b border-[var(--admin-border)] flex justify-between items-center">
              <h3 className="text-lg font-bold text-[var(--admin-text)]">결제 내역 조회</h3>
              <button onClick={() => setPaymentHistoryTarget(null)} className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-[var(--admin-text-muted)] mb-4">
                <strong className="text-[var(--admin-primary)]">{paymentHistoryTarget.email}</strong> 님의 결제 내역입니다. (추후 PG사 연동 시 내역이 표시됩니다)
              </p>
              <div className="border border-[var(--admin-border)] rounded-lg overflow-hidden bg-[var(--admin-surface)]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--admin-surface-bright)] border-b border-[var(--admin-border)] text-[var(--admin-text-muted)]">
                    <tr>
                      <th className="p-3 font-medium">결제일</th>
                      <th className="p-3 font-medium">내역</th>
                      <th className="p-3 font-medium">금액</th>
                      <th className="p-3 font-medium">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-[var(--admin-text-muted)]">결제 내역이 없습니다.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-4 border-t border-[var(--admin-border)] bg-[var(--admin-surface-bright)] flex justify-end">
              <button onClick={() => setPaymentHistoryTarget(null)} className="px-4 py-2 text-sm font-medium border border-[var(--admin-border)] rounded-xl text-[var(--admin-text)] bg-[var(--admin-surface)] hover:bg-[var(--admin-surface-bright)] transition-colors">
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirm Modal */}
      {confirmConfig?.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
          <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl w-full max-w-sm overflow-hidden shadow-2xl p-6">
            <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4 text-center">
              {confirmConfig.title}
            </h3>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setConfirmConfig(null)}
                className="px-4 py-2 bg-transparent border border-[var(--admin-border)] text-[var(--admin-text)] hover:bg-[var(--admin-border)] rounded-md transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmConfig.onConfirm}
                className="px-4 py-2 bg-[var(--admin-primary)] text-white hover:brightness-110 rounded-md transition-colors font-medium shadow-lg"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Modal */}
      {auditTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
          <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-[var(--admin-border)] flex justify-between items-center bg-[var(--admin-background)]">
              <h2 className="text-lg font-semibold text-[var(--admin-text)] font-montserrat">
                {auditTarget.email} 계정 탈퇴/정지 정보
              </h2>
              <button onClick={() => setAuditTarget(null)} className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {loadingAudit ? (
                <div className="text-center py-8 text-[var(--admin-text-muted)]">불러오는 중...</div>
              ) : auditLogs.length === 0 ? (
                <div className="text-center py-8 text-[var(--admin-text-muted)]">기록된 탈퇴/정지 이력이 없습니다.</div>
              ) : (
                <div className="space-y-4">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-4 rounded-lg bg-[var(--admin-background)] border border-[var(--admin-border)]">
                      <div className="flex justify-between items-start mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {log.action_name}
                        </span>
                        <span className="text-xs text-[var(--admin-text-muted)]">
                          {new Date(log.created_at).toLocaleString('ko-KR')}
                        </span>
                      </div>
                      {log.admin_email && (
                        <div className="text-sm text-[var(--admin-text)] mt-1">
                          <span className="text-[var(--admin-text-muted)]">처리자:</span> {log.admin_email}
                        </div>
                      )}
                      {log.reason && (
                        <div className="text-sm text-[var(--admin-text)] mt-1">
                          <span className="text-[var(--admin-text-muted)]">사유:</span> {log.reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-[var(--admin-border)] bg-[var(--admin-background)] flex justify-end">
              <button 
                onClick={() => setAuditTarget(null)}
                className="px-4 py-2 bg-[var(--admin-border)] hover:brightness-95 text-[var(--admin-text)] rounded-md font-medium"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTP Reset Modal */}
      {resettingEmail && (
        <OTPResetModal 
          email={resettingEmail} 
          onClose={() => setResettingEmail(null)} 
          onConfirm={confirmOTPReset} 
        />
      )}
    </div>
  );
}

function SubscriptionsTab() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in-95 duration-500">
      <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-blue-100 dark:border-blue-800/50">
        <CreditCard className="w-10 h-10" />
      </div>
      <h2 className="text-[32px] font-bold font-montserrat text-[var(--admin-text)] mb-2">구독 및 라이선스 관리</h2>
      <p className="text-[var(--admin-text-muted)] max-w-md mx-auto mb-8">
        결제 내역, 요금제 변경 이력, 그리고 발급된 라이선스 키 현황을 한눈에 관리할 수 있는 페이지가 곧 제공됩니다.
      </p>
      <button className="px-6 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-sm">
        준비 중 (Next Week)
      </button>
    </div>
  );
}





function FutureFeatureTab({ title, features }: { title: string, features: string[] }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in-95 duration-500">
      <div className="w-20 h-20 bg-[var(--admin-surface-bright)] border border-[var(--admin-border)] rounded-full flex items-center justify-center mb-6">
        <Construction className="w-10 h-10 text-[var(--admin-primary)]" />
      </div>
      <h2 className="text-[32px] font-bold text-[var(--admin-text)] mb-6 font-montserrat">{title}</h2>
      
      <div className="admin-glass-card p-8 max-w-lg w-full text-left">
        <h3 className="text-sm font-semibold text-[var(--admin-text)] mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[var(--admin-secondary)]" />
          추후 개발 예정 기능
        </h3>
        <ul className="space-y-3">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-[var(--admin-text-muted)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--admin-primary)] mt-1.5 flex-shrink-0"></span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <span className="inline-block mt-8 px-4 py-1.5 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-full text-sm font-medium text-[var(--admin-text-muted)]">
        🚀 비즈니스 확장 시 개발됩니다
      </span>
    </div>
  );
}
