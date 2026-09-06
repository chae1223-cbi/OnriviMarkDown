// ====================================================================
// 📊 [OMD-API-knowledgeDetail-0001] route.ts ➔ Knowledge Document Detail API Route
// 🎯 @KICK  : 특정 지식 문서의 전체 상세 내역(AI 요약, 키포인트, 태그, 모든 청크 계층 및 라인 정보) 조회
// 🛡️ @GUARD : Node.js 서버 환경 보장, 리소스 폴더 안전 승격, 존재하지 않는 문서 404 방어
// 🚨 @PATCH : **2026-09-04** — [ONRIVI-KNOWLEDGE-ENGINE-004] 지식 문서 상세 정보 조회 엔드포인트 신규 구현
// 🔗 @CALLS : @/lib/knowledge/knowledgeService
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { KnowledgeService } from '@/lib/knowledge/knowledgeService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { documentId, filePath, resourceFolder, geminiApiKey, planCode } = body;

    if (!documentId && !filePath) {
      return NextResponse.json(
        { ok: false, message: 'documentId 또는 filePath가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!resourceFolder || !resourceFolder.trim()) {
      return NextResponse.json(
        { ok: false, code: 'NO_RESOURCE_FOLDER', message: '리소스 폴더가 설정되지 않았습니다.' },
        { status: 400 }
      );
    }

    const detail = KnowledgeService.getDocumentDetail({
      documentId,
      filePath,
      resourceFolder: resourceFolder.trim(),
      geminiApiKey: geminiApiKey || 'DUMMY_KEY',
      planCode: planCode || 'ELITEPRO',
    });

    if (!detail) {
      return NextResponse.json(
        { ok: false, message: '문서를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      detail,
    });
  } catch (err: any) {
    console.error('[/api/knowledge/detail POST Error]:', err);
    return NextResponse.json(
      { ok: false, message: err?.message || '문서 상세 정보를 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get('docId') || searchParams.get('documentId') || undefined;
    const filePath = searchParams.get('filePath') || undefined;
    const resourceFolder = searchParams.get('resourceFolder') || 'Onrivi_Asset';
    const planCode = searchParams.get('planCode') || 'ELITEPRO';

    if (!documentId && !filePath) {
      return NextResponse.json(
        { ok: false, message: 'documentId 또는 filePath가 필요합니다.' },
        { status: 400 }
      );
    }

    const detail = KnowledgeService.getDocumentDetail({
      documentId,
      filePath,
      resourceFolder: resourceFolder.trim(),
      geminiApiKey: 'DUMMY_KEY',
      planCode,
    });

    if (!detail) {
      return NextResponse.json(
        { ok: false, message: '문서를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      detail,
    });
  } catch (err: any) {
    console.error('[/api/knowledge/detail GET Error]:', err);
    return NextResponse.json(
      { ok: false, message: err?.message || '문서 상세 정보를 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
