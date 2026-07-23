'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Users, TrendingUp, CreditCard, Activity, Search, Filter, MoreVertical, Plus } from 'lucide-react';

function AdminPageContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'dashboard';

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {tab === 'dashboard' && <DashboardTab />}
      {tab === 'users' && <UsersTab />}
      {tab === 'subscriptions' && <SubscriptionsTab />}
      {tab === 'codes' && <CodesTab />}
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
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">대시보드</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">Onrivi 서비스의 전반적인 현황을 확인합니다.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
            <h3 className="text-neutral-500 dark:text-neutral-400 font-medium text-sm">{stat.title}</h3>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mock Chart Area */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">주간 활성 사용자 (WAU)</h3>
            <button className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">상세보기</button>
          </div>
          <div className="h-64 flex items-end justify-between gap-2 px-2">
            {[40, 55, 45, 70, 65, 85, 100].map((h, i) => (
              <div key={i} className="w-full bg-blue-100 dark:bg-blue-900/20 rounded-t-md relative group">
                <div 
                  className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-md transition-all duration-500 group-hover:opacity-90"
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-neutral-500 dark:text-neutral-400 px-2">
            <span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span><span>일</span>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">최근 가입 유저</h3>
          <div className="space-y-4">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800 flex items-center justify-center font-bold text-neutral-600 dark:text-neutral-300">
                  U{i}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">user{i}@example.com</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">방금 전 가입 (무료 체험)</p>
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
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">사용자 관리</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">가입된 회원 목록을 조회하고 계정을 제어합니다.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1E293B] border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
            <Filter className="w-4 h-4" /> 필터
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1E293B] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="이메일 또는 ID로 검색..." 
              className="w-full pl-10 pr-4 py-2 bg-neutral-100 dark:bg-neutral-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/50 dark:bg-neutral-900/50 text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">사용자 이메일</th>
                <th className="px-6 py-4 font-medium">요금제</th>
                <th className="px-6 py-4 font-medium">상태</th>
                <th className="px-6 py-4 font-medium">가입일</th>
                <th className="px-6 py-4 font-medium text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {[
                { email: 'ceo@onrivi.com', plan: 'Elite Pro', status: 'ACTIVE', date: '2026-07-20' },
                { email: 'user2@gmail.com', plan: 'Apprentice', status: 'ACTIVE', date: '2026-07-19' },
                { email: 'tester@test.com', plan: 'Reader', status: 'FREE', date: '2026-07-18' },
                { email: 'baduser@spam.com', plan: 'Free Trial', status: 'SUSPENDED', date: '2026-07-15' },
              ].map((user, i) => (
                <tr key={i} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xs">
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-neutral-900 dark:text-neutral-200 text-sm">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.status === 'ACTIVE' || user.status === 'FREE' ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30' : 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/30'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'ACTIVE' || user.status === 'FREE' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">{user.date}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination mock */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400">
          <span>총 1,248명 중 1-10</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-neutral-200 dark:border-neutral-700 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50" disabled>이전</button>
            <button className="px-3 py-1 border border-neutral-200 dark:border-neutral-700 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50">1</button>
            <button className="px-3 py-1 border border-neutral-200 dark:border-neutral-700 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800">2</button>
            <button className="px-3 py-1 border border-neutral-200 dark:border-neutral-700 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800">다음</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubscriptionsTab() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in-95 duration-500">
      <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-blue-100 dark:border-blue-800/50">
        <CreditCard className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">구독 및 라이선스 관리</h2>
      <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-8">
        결제 내역, 요금제 변경 이력, 그리고 발급된 라이선스 키 현황을 한눈에 관리할 수 있는 페이지가 곧 제공됩니다.
      </p>
      <button className="px-6 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-sm">
        준비 중 (Next Week)
      </button>
    </div>
  );
}

function CodesTab() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">공통 코드 관리</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">시스템에서 사용되는 정적 코드(sys_codes)를 관리합니다.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20">
          <Plus className="w-4 h-4" /> 코드 추가
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Group Selector */}
        <div className="bg-white dark:bg-[#1E293B] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm p-4 h-fit">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4 uppercase tracking-wider">코드 그룹 (Group)</h3>
          <div className="space-y-1">
            {['PLAN_TYPE', 'PLAN_STATUS', 'DEVICE_TYPE', 'INQUIRY_CATEGORY'].map((group, i) => (
              <button 
                key={i}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
                  i === 0 
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                {group}
              </button>
            ))}
          </div>
        </div>

        {/* Code List */}
        <div className="md:col-span-2 bg-white dark:bg-[#1E293B] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
            <h3 className="font-semibold text-neutral-900 dark:text-white">PLAN_TYPE 상세 코드</h3>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-800">
                <th className="px-6 py-3 font-medium">코드 값 (Value)</th>
                <th className="px-6 py-3 font-medium">표시명 (Name)</th>
                <th className="px-6 py-3 font-medium">사용 여부</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {[
                { val: 'FREE', name: '무료 체험', active: true },
                { val: 'READER', name: '리더 플랜', active: true },
                { val: 'APPRENTICE', name: '어프렌티스', active: true },
                { val: 'ELITEPRO', name: '엘리트 프로', active: true },
                { val: 'ENTERPRISE', name: '엔터프라이즈', active: false },
              ].map((code, i) => (
                <tr key={i} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-neutral-900 dark:text-neutral-200">{code.val}</td>
                  <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-300">{code.name}</td>
                  <td className="px-6 py-4">
                    <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${code.active ? 'bg-blue-600' : 'bg-neutral-300 dark:bg-neutral-700'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${code.active ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
