// ====================================================================
// 📊 [OMD-API-knowledgeList-0001] route.ts ➔ Knowledge List API Route
// 🎯 @KICK  : 등록된 모든 지식 문서 목록(상태, 요약, 태그, 청크수 등) 반환
// 🛡️ @GUARD : Node.js 서버 환경 보장, 리소스 폴더 Fallback
// 🚨 @PATCH : **2026-09-04** — [ONRIVI-KNOWLEDGE-ENGINE-003] 등록 지식 문서 목록 조회 엔드포인트 구현
// 🔗 @CALLS : @/lib/knowledge/knowledgeService
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { KnowledgeService } from '@/lib/knowledge/knowledgeService';
import path from 'node:path';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { resourceFolder, geminiApiKey, planCode } = body;

    if (!resourceFolder || !resourceFolder.trim()) {
      return NextResponse.json(
        { ok: false, code: 'NO_RESOURCE_FOLDER', message: '공통 자원(리소스) 폴더가 설정되지 않았습니다. 환경설정에서 리소스 폴더를 먼저 지정해 주세요.', documents: [] },
        { status: 400 }
      );
    }
    const effectiveResourceFolder = resourceFolder.trim();

    const documents = KnowledgeService.listDocuments({
      resourceFolder: effectiveResourceFolder,
      geminiApiKey: geminiApiKey || 'DUMMY_KEY_FOR_LIST',
      planCode: planCode || 'ELITEPRO',
    });

    return NextResponse.json({
      ok: true,
      documents,
    });
  } catch (err: any) {
    console.error('[/api/knowledge/list Error]:', err);
    return NextResponse.json(
      { ok: false, message: err?.message || '지식 문서 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
