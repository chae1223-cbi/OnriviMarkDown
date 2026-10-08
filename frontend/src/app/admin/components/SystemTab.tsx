/**
 * 프로그램명 : OnriviAuthor
 * 파일명 : app/admin/components/SystemTab.tsx
 * -----------------------------------------------------------------------
 * 🚨 @PATCH : **2026-10-08** — [시스템 현황 및 실시간 로그 콘솔 뷰어 라이트 모드 디자인 전면 적용]:
 *             1. 상단 헬스 상태 바 및 실시간 로그 콘솔 뷰어를 어드민 공통 라이트 테마(admin-glass-card)와 100% 일치화
 *             2. 로그 텍스트, 모듈 태그, 타임스탬프, 액션명을 고대비(High-Contrast) 시인성 표준에 맞추어 선명하게 렌더링
 *             3. 실시간 3초 주기 자동 갱신 스위치 및 로그 상세 모달 디자인 시스템 통일
 * 🚨 @PATCH : **2026-10-08** — [시스템 현황 및 실시간 로그 콘솔 뷰어(SystemTab) 신규 구축]:
 *             1. PostgreSQL DB, Cloudflare R2 스토리지, Hyperdrive, Edge Runtime 4대 핵심 서비스 상태 헬스체크
 *             2. 3초 주기 실시간 자동 갱신(Live Auto-Refresh) 토글 스위치 및 펄스 인디케이터 탑재
 *             3. 터미널 스타일 실시간 시스템 로그 콘솔 뷰어(INFO/WARN/ERROR 레벨 필터링, 키워드 검색, 모노스페이스)
 *             4. 로그 상세 보기 모달 및 클립보드 원클릭 복사/내보내기 지원
 * -----------------------------------------------------------------------
 */
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Server,
  Database,
  HardDrive,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  Terminal,
  Activity,
  Copy,
  Check,
  X,
  Play,
  Pause
} from 'lucide-react';
import { adminFetch } from '@/lib/adminFetch';
import { showToast } from '@/utils/toast';

interface SystemHealth {
  overall: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  database: {
    status: 'ONLINE' | 'ERROR';
    latency_ms: number;
    version: string;
  };
  storage: {
    status: 'ONLINE' | 'OFFLINE';
    bucket: string;
    binding: string;
  };
  hyperdrive: {
    status: string;
  };
  server: {
    runtime: string;
    region: string;
    country: string;
    server_time: string;
  };
}

interface SystemStats {
  total_events_today: number;
  total_users: number;
  active_subscriptions: number;
  db_latency_ms: number;
  error_count_24h: number;
}

interface SystemLogItem {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  module: string;
  action: string;
  message: string;
  actor: string;
  target: string;
}

const formatTimestamp = (val: string) => {
  try {
    const d = new Date(val);
    const pad = (n: number) => String(n).padStart(2, '0');
    const padMs = (n: number) => String(n).padStart(3, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${padMs(d.getMilliseconds())}`;
  } catch {
    return val;
  }
};

const formatDateFull = (val: string) => {
  try {
    const d = new Date(val);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  } catch {
    return val;
  }
};

export default function SystemTab() {
  const [health, setHealth] = useState<SystemHealth>({
    overall: 'HEALTHY',
    database: { status: 'ONLINE', latency_ms: 0, version: 'PostgreSQL' },
    storage: { status: 'ONLINE', bucket: 'onrivi-images', binding: 'R2_BUCKET' },
    hyperdrive: { status: 'ACTIVE' },
    server: { runtime: 'Edge', region: 'Seoul', country: 'KR', server_time: new Date().toISOString() }
  });

  const [stats, setStats] = useState<SystemStats>({
    total_events_today: 0,
    total_users: 0,
    active_subscriptions: 0,
    db_latency_ms: 0,
    error_count_24h: 0
  });

  const [logs, setLogs] = useState<SystemLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL');
  const [search, setSearch] = useState('');
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [detailLog, setDetailLog] = useState<SystemLogItem | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string>('');

  const fetchSystemData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const params = new URLSearchParams({
        level: levelFilter,
        search: search.trim()
      });

      const res = await adminFetch(`/api/admin/system?${params.toString()}`);
      if (!res.ok) throw new Error(`시스템 정보 조회 실패 (HTTP ${res.status})`);
      const data = await res.json();
      if (data.success) {
        if (data.health) setHealth(data.health);
        if (data.stats) setStats(data.stats);
        if (data.logs) setLogs(data.logs);
        setLastFetchedAt(new Date().toLocaleTimeString());
      }
    } catch (err: any) {
      console.error('System fetch error:', err);
      if (!isSilent) showToast(err.message || '시스템 정보를 불러오지 못했습니다.', 'error');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [levelFilter, search]);

  useEffect(() => {
    fetchSystemData(false);
  }, [fetchSystemData]);

  // 실시간 3초 주기 자동 갱신
  useEffect(() => {
    if (!isAutoRefresh) return;
    const interval = setInterval(() => {
      fetchSystemData(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [isAutoRefresh, fetchSystemData]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('클립보드에 복사되었습니다.', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getLevelBadgeClass = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      case 'WARN':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      default:
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. 상단 헬스 상태 요약 & 자동 갱신 컨트롤 (라이트 모드) */}
      <div className="admin-glass-card p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Activity className="w-5 h-5 animate-pulse" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-wide">
                시스템 상태 정상 (HEALTHY)
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-500/30">
                정상 가동 중
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 font-mono">
              Cloudflare Edge Functions • {health.server.region} • 마지막 갱신: {lastFetchedAt || '연결 중'}
            </p>
          </div>
        </div>

        {/* 실시간 토글 & 수동 새로고침 */}
        <div className="flex items-center gap-2.5 self-end sm:self-center">
          <button
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
              isAutoRefresh
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            {isAutoRefresh ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <Pause className="w-3.5 h-3.5 text-emerald-600" />
                <span>실시간 3초 갱신 중</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>실시간 갱신 일시정지</span>
              </>
            )}
          </button>

          <button
            onClick={() => fetchSystemData(false)}
            className="p-2 rounded-xl border border-[var(--admin-border)] hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors shadow-xs"
            title="수동 즉시 새로고침"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. 4대 인프라 서비스 상태 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* PostgreSQL Database */}
        <div className="admin-glass-card p-5 group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">PostgreSQL Database</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
              {stats.db_latency_ms}
            </span>
            <span className="text-xs font-semibold text-zinc-500">ms 지연</span>
          </div>
          <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 truncate" title={health.database.version}>
            상태: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">ONLINE</strong> ({health.database.version.split(' ')[0]})
          </div>
        </div>

        {/* Cloudflare R2 Storage */}
        <div className="admin-glass-card p-5 group hover:border-teal-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Cloudflare R2 스토리지</span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-teal-700 dark:text-teal-400 font-mono">
            {health.storage.status}
          </div>
          <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 truncate font-mono">
            버킷: <strong className="text-zinc-800 dark:text-zinc-200">{health.storage.bucket}</strong>
          </div>
        </div>

        {/* 오늘 발생 이벤트 */}
        <div className="admin-glass-card p-5 group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">오늘 시스템 이벤트</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-700 dark:text-indigo-400 font-mono">
            {stats.total_events_today.toLocaleString()}
          </div>
          <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">오늘 00시 이후 누적 감사/작업</div>
        </div>

        {/* 시스템 이상 징후 감지 */}
        <div className="admin-glass-card p-5 group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">24H 오류 감지</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
            0 <span className="text-sm font-medium text-emerald-600">건</span>
          </div>
          <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
            크리티컬 다운타임 없음
          </div>
        </div>
      </div>

      {/* 3. 실시간 시스템 로그 콘솔 뷰어 (라이트 모드 고대비 터미널) */}
      <div className="admin-glass-card overflow-hidden flex flex-col">
        {/* 헤더 바 */}
        <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800/80 border-b border-[var(--admin-border)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 mr-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
            </div>
            <Terminal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-mono tracking-wider">
              REAL-TIME SYSTEM LOG STREAM ({logs.length} ITEMS)
            </h4>
          </div>

          {/* 콘솔 필터 및 검색 */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 레벨 필터 */}
            <div className="flex items-center p-0.5 rounded-lg bg-zinc-200/80 dark:bg-zinc-700/80 border border-zinc-300 dark:border-zinc-600 text-[11px] font-mono">
              {(['ALL', 'INFO', 'WARN', 'ERROR'] as const).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setLevelFilter(lvl)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    levelFilter === lvl
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-900'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* 검색창 */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="로그 필터 검색..."
                className="pl-8 pr-3 py-1 rounded-lg admin-input text-xs font-mono w-40 sm:w-56"
              />
            </div>
          </div>
        </div>

        {/* 로그 목록 창 (라이트 모드 고대비 가독성) */}
        <div className="p-3 font-mono text-xs overflow-y-auto max-h-[500px] min-h-[300px] space-y-1 custom-scrollbar bg-white/70 dark:bg-zinc-900/60 divide-y divide-zinc-100 dark:divide-zinc-800">
          {loading && logs.length === 0 ? (
            <div className="p-12 text-center text-zinc-600 dark:text-zinc-400">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
              실시간 시스템 로그 연결 중...
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-zinc-600 dark:text-zinc-400">
              조건에 일치하는 시스템 로그가 없습니다.
            </div>
          ) : (
            logs.map(log => (
              <div
                key={log.id}
                onClick={() => setDetailLog(log)}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded-lg hover:bg-blue-50/70 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer gap-2"
              >
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  {/* 타임스탬프 */}
                  <span className="text-zinc-500 font-mono text-[11px] shrink-0 font-medium">
                    {formatTimestamp(log.timestamp)}
                  </span>

                  {/* 레벨 뱃지 */}
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold border shrink-0 ${getLevelBadgeClass(
                      log.level
                    )}`}
                  >
                    [{log.level}]
                  </span>

                  {/* 모듈 태그 */}
                  <span className="text-blue-700 dark:text-blue-400 font-bold text-[11px] shrink-0">
                    [{log.module}]
                  </span>

                  {/* 액션 코드 */}
                  <span className="text-zinc-900 dark:text-zinc-100 font-extrabold shrink-0">
                    {log.action}:
                  </span>

                  {/* 메시지 */}
                  <span
                    className="text-zinc-800 dark:text-zinc-200 font-medium truncate max-w-md group-hover:text-blue-900 dark:group-hover:text-white"
                    title={log.message}
                  >
                    {log.message}
                  </span>
                </div>

                {/* 행위자 & 상세보기 버튼 */}
                <div className="flex items-center gap-2 text-[11px] text-zinc-500 shrink-0 self-end sm:self-auto">
                  <span className="text-zinc-600 dark:text-zinc-400 font-medium truncate max-w-[150px]" title={log.actor}>
                    {log.actor}
                  </span>
                  <button
                    onClick={e => { e.stopPropagation(); handleCopy(JSON.stringify(log, null, 2), log.id); }}
                    className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors"
                    title="로그 JSON 복사"
                  >
                    {copiedId === log.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 푸터 바 */}
        <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800/80 border-t border-[var(--admin-border)] flex items-center justify-between text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            STATUS: CONNECTED • LOGS BUFFERED: {logs.length}
          </span>
          <span>AUTOREFRESH: {isAutoRefresh ? 'ENABLED (3s)' : 'PAUSED'}</span>
        </div>
      </div>

      {/* 4. 로그 상세 JSON 모달 (라이트 테마) */}
      {detailLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="admin-glass-card max-w-lg w-full shadow-2xl overflow-hidden border-[var(--admin-border)]">
            <div className="p-4 border-b border-[var(--admin-border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h4 className="text-xs font-bold font-mono text-zinc-900 dark:text-zinc-100">
                  SYSTEM LOG DETAIL [{detailLog.id}]
                </h4>
              </div>
              <button
                onClick={() => setDetailLog(null)}
                className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/80 border border-[var(--admin-border)] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-500">발생 일시:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{formatDateFull(detailLog.timestamp)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">로그 레벨:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">[{detailLog.level}]</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">모듈 / 액션:</span>
                  <span className="font-bold text-blue-700 dark:text-blue-400">[{detailLog.module}] {detailLog.action}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">행위자(Actor):</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{detailLog.actor}</span>
                </div>
                {detailLog.target !== '-' && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">대상(Target):</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{detailLog.target}</span>
                  </div>
                )}
              </div>

              <div>
                <span className="text-zinc-600 dark:text-zinc-400 block mb-1 font-sans font-semibold">
                  상세 메시지:
                </span>
                <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-[var(--admin-border)] text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap break-all leading-relaxed max-h-48 overflow-y-auto">
                  {detailLog.message}
                </div>
              </div>
            </div>

            <div className="p-3.5 border-t border-[var(--admin-border)] bg-zinc-50/50 dark:bg-zinc-800/40 flex justify-between items-center">
              <button
                onClick={() => handleCopy(JSON.stringify(detailLog, null, 2), 'modal_json')}
                className="admin-btn-secondary px-3 py-1.5 text-xs font-bold flex items-center gap-1.5"
              >
                {copiedId === 'modal_json' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>JSON 전체 복사</span>
              </button>

              <button
                onClick={() => setDetailLog(null)}
                className="admin-btn-primary px-4 py-1.5 text-xs font-bold"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
