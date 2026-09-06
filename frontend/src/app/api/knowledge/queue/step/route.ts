// ====================================================================
// 📊 [OMD-API-knowledgeQueueStep-0001] route.ts ➔ Knowledge Queue Step API
// 🎯 @KICK  : 로컬 SQLite 큐 작업의 현재 파이프라인 단계(HASH, PARSE, CHUNK, AI_ANALYSIS, VALIDATION, FTS_INDEX) 갱신
// 🛡️ @GUARD : Node.js 서버 환경 보장
// 🚨 @PATCH : **2026-09-04** — [ONRIVI-KNOWLEDGE-ENGINE-002.1] KUI-008 파이프라인 단계 추적용 엔드포인트 최초 구현
// 🔗 @CALLS : @/lib/knowledge/knowledgeDb
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { 
  getResourceKnowledgeDbPath, 
  initKnowledgeDatabase, 
  updateJobStep 
} from '@/lib/knowledge/knowledgeDb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId, step, errorLog, resourceFolder } = body;

    if (!jobId || !step) {
      return NextResponse.json({ ok: false, message: 'jobId와 step이 필요합니다.' }, { status: 400 });
    }

    const safeFolder = resourceFolder || 'Onrivi_Asset';
    const dbPath = getResourceKnowledgeDbPath(safeFolder);
    const db = initKnowledgeDatabase(dbPath);

    updateJobStep(db, jobId, step, errorLog);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      message: err?.message || '작업 단계 갱신 중 오류 발생'
    }, { status: 500 });
  }
}
