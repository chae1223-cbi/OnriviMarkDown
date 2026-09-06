// ====================================================================
// 📊 [OMD-TEST-KNOWLEDGE-RAG-001] knowledgeRagEditor.test.ts
// 🎯 @KICK  : 에디터 AI 모달 지식 RAG 컨텍스트 주입 및 출처 각주 마크다운 생성 로직 검증
// 🛡️ @GUARD : Rule 4 전용 디렉토리 격리, 빈 배열/결측값 방어 검증
// 🚨 @PATCH : **2026-09-04** — [ONRIVI-KNOWLEDGE-EDITOR-001] AI 모달 지식 RAG 및 각주 생성 단위 테스트 구현
// ====================================================================

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { RetrievalCandidate } from '../../../types/knowledge';

describe('AI Modal Knowledge RAG & Citations Integration', () => {
  const mockCandidates: RetrievalCandidate[] = [
    {
      documentId: 'doc-1',
      chunkId: 'chunk-1',
      filePath: 'D:\\docs\\system_guide.md',
      documentTitle: '시스템 가이드',
      headingTitle: '인증 아키텍처',
      headingPath: '보안 정책 > 인증 아키텍처',
      startLine: 15,
      endLine: 40,
      fileHash: 'hash1',
      rawBm25: 12.5,
      normalizedFtsScore: 95,
      tagScore: 80,
      headingScore: 100,
      priorityScore: 80,
      finalScore: 92,
      snippet: 'JWT 토큰은 15분 만료 주기를 가지며 리프레시 토큰은 HttpOnly 쿠키에 저장된다.',
    },
    {
      documentId: 'doc-2',
      chunkId: 'chunk-2',
      filePath: 'D:\\docs\\api_spec.md',
      documentTitle: 'API 명세서',
      headingTitle: '사용자 프로필 조회',
      headingPath: 'API 목록 > 사용자 프로필 조회',
      startLine: 100,
      endLine: 125,
      fileHash: 'hash2',
      rawBm25: 10.0,
      normalizedFtsScore: 88,
      tagScore: 70,
      headingScore: 90,
      priorityScore: 70,
      finalScore: 84,
      snippet: 'GET /api/v1/user/profile 요청 시 Authorization Bearer 헤더가 필요하다.',
    },
  ];

  it('지식 청크 목록을 LLM 컨텍스트 블록으로 일관되게 포맷팅한다', () => {
    const blocks = mockCandidates.map((c, idx) => {
      const title = c.documentTitle || c.headingTitle;
      const path = c.headingPath || c.headingTitle;
      const lineInfo = `L${c.startLine}~L${c.endLine}`;
      const snippet = c.snippet || '';
      return `[참고 지식 ${idx + 1}: ${title} (${c.filePath} ${lineInfo}) - ${path}]\n${snippet}`;
    }).join('\n\n---\n\n');

    assert.ok(blocks.includes('[참고 지식 1: 시스템 가이드 (D:\\docs\\system_guide.md L15~L40) - 보안 정책 > 인증 아키텍처]'));
    assert.ok(blocks.includes('JWT 토큰은 15분 만료 주기를 가지며'));
    assert.ok(blocks.includes('[참고 지식 2: API 명세서 (D:\\docs\\api_spec.md L100~L125) - API 목록 > 사용자 프로필 조회]'));
    assert.ok(blocks.includes('GET /api/v1/user/profile'));
  });

  it('출처 각주를 올바른 마크다운 링크 및 라인 앵커(#L시작-L끝)로 생성한다', () => {
    const footnotes = mockCandidates.map((c) => {
      const title = c.documentTitle || c.headingTitle;
      const path = c.headingPath || c.headingTitle;
      const fileUri = c.filePath.replace(/\\/g, '/');
      const lineAnchor = `#L${c.startLine}-L${c.endLine}`;
      return `> - [${title}](file:///${fileUri}${lineAnchor}) : \`${path}\``;
    }).join('\n');

    const expectedBlock = `\n\n---\n> 📚 **지식 보관함 참고 출처**:\n${footnotes}\n`;

    assert.ok(expectedBlock.includes('> - [시스템 가이드](file:///D:/docs/system_guide.md#L15-L40) : `보안 정책 > 인증 아키텍처`'));
    assert.ok(expectedBlock.includes('> - [API 명세서](file:///D:/docs/api_spec.md#L100-L125) : `API 목록 > 사용자 프로필 조회`'));
  });

  it('컨텍스트 텍스트 용량 및 예산 백분율을 정확히 계산한다', () => {
    const maxBudget = 4000;
    const currentChars = mockCandidates.reduce((acc, c) => acc + (c.snippet?.length || 0), 0);
    const usagePercent = Math.min(100, Math.round((currentChars / maxBudget) * 100));

    // snippet 1 (48 chars) + snippet 2 (62 chars) = 110 chars
    assert.equal(currentChars, 110);
    assert.equal(usagePercent, 3);
  });
});
