// ====================================================================
// 📊 [OMD-API-knowledgeIndex-0001] route.ts ➔ Knowledge Index API Route
// 🎯 @KICK  : 웹 브라우저 환경에서 지식 베이스 등록 요청을 받아 Node.js 서버 런타임의 SQLite DB 색인 및 AI 분석 수행
// 🛡️ @GUARD : Node.js 서버 환경 보장, 3대 가드 검증, 에러 JSON 응답
// 🚨 @PATCH : **2026-09-04** — [백그라운드 큐 워커 지원] fileContent 누락 시 로컬 파일시스템(fs.readFileSync) 자동 로드 폴백 추가
//             **2026-09-04** — [등록 결과 상세 내역 응답] result.detail(청크, 태그, 검색어) 반환 지원
//             **2026-09-04** — [ONRIVI-KNOWLEDGE-ENGINE-002.1] 웹 브라우저 지원용 /api/knowledge/index API 라우트 최초 구현
// 🔗 @CALLS : @/lib/knowledge/knowledgeService
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { KnowledgeService } from '@/lib/knowledge/knowledgeService';

import path from 'node:path';
import fs from 'node:fs';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { filePath, fileContent, title, resourceFolder, geminiApiKey, planCode, aiModelName } = body;

    // 🛡️ 백그라운드 큐 워커에서 filePath만 넘긴 경우 로컬 디스크에서 내용 자동 읽기
    if (!fileContent && filePath && fs.existsSync(filePath)) {
      try {
        fileContent = fs.readFileSync(filePath, 'utf-8');
      } catch (readErr) {
        console.warn('[/api/knowledge/index] 로컬 파일 직접 읽기 실패:', readErr);
      }
    }

    console.log('[/api/knowledge/index Received]:', {
      filePath,
      hasContent: Boolean(fileContent),
      contentLen: fileContent?.length,
      resourceFolder,
      hasApiKey: Boolean(geminiApiKey),
      planCode,
      aiModelName: aiModelName || 'gemini-3.8-flash'
    });

    if (!filePath || !fileContent) {
      return NextResponse.json(
        { ok: false, message: 'filePath와 fileContent는 필수 항목입니다.' },
        { status: 400 }
      );
    }

    // 사용자 환경설정에 지정된 공통 자원(리소스) 폴더만 순수하게 사용 (프로젝트 폴더 임의 생성 원천 차단)
    if (!resourceFolder || !resourceFolder.trim()) {
      return NextResponse.json(
        { ok: false, code: 'NO_RESOURCE_FOLDER', message: '공통 자원(리소스) 폴더가 설정되지 않았습니다. 환경설정에서 리소스 폴더를 먼저 지정해 주세요.' },
        { status: 400 }
      );
    }
    const effectiveResourceFolder = resourceFolder.trim();

    const result = await KnowledgeService.indexDocument({
      filePath,
      fileContent,
      title,
      resourceFolder: effectiveResourceFolder,
      geminiApiKey,
      planCode: planCode || 'ELITEPRO',
      aiModelName: aiModelName || 'gemini-3.8-flash',
    });

    return NextResponse.json({
      ok: true,
      documentId: result.documentId,
      chunksCount: result.chunksCount,
      detail: result.detail,
    });
  } catch (err: any) {
    console.error('[/api/knowledge/index Error Caught]:', err);
    return NextResponse.json(
      { ok: false, message: err?.message || '지식 베이스 등록 중 서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
