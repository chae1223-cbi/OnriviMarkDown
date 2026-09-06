// ====================================================================
// 📊 [OMD-API-knowledgeQueueStats-0001] route.ts ➔ Knowledge Queue Stats API
// 🎯 @KICK  : 로컬 SQLite 큐의 작업 현황(총계, 대기, 실행중, 성공, 실패, 진행률) 통계 반환 (GET/POST)
// 🛡️ @GUARD : Node.js 서버 환경 보장, 리소스 폴더 안전 승격, GET/POST 이중 지원
// 🚨 @PATCH : **2026-09-04** — [ONRIVI-KNOWLEDGE-ENGINE-002.1] KUI-007 진행률 및 KUI-001 대시보드 연동용 큐 통계 API 라우트 GET/POST 이중 지원
// 🔗 @CALLS : @/lib/knowledge/knowledgeDb
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { 
  getResourceKnowledgeDbPath, 
  initKnowledgeDatabase, 
  getQueueStats 
} from '@/lib/knowledge/knowledgeDb';

export const dynamic = 'force-dynamic';

function getStatsResponse(resourceFolder?: string | null) {
  const safeFolder = resourceFolder || 'Onrivi_Asset';
  const dbPath = getResourceKnowledgeDbPath(safeFolder);
  const db = initKnowledgeDatabase(dbPath);

  const stats = getQueueStats(db);
  const percent = stats.total > 0 
    ? Math.round((stats.success / stats.total) * 100) 
    : 0;

  return {
    ok: true,
    stats: {
      total: stats.total,
      completed: stats.success,
      running: stats.running,
      queued: stats.queued,
      failed: stats.failed,
      percent,
      activeWorkers: Math.min(stats.running, 2),
      maxWorkers: 2,
      isPaused: false,
      rateLimitStatus: 'NORMAL',
    }
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const resourceFolder = searchParams.get('resourceFolder');
    const result = getStatsResponse(resourceFolder);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      message: err?.message || '큐 통계 조회 중 오류 발생'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { resourceFolder } = body;
    const result = getStatsResponse(resourceFolder);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      message: err?.message || '큐 통계 조회 중 오류 발생'
    }, { status: 500 });
  }
}
