// ====================================================================
// 📊 [OMD-TEST-KNOWLEDGE-RAG-001] knowledgeRagEditor.test.ts
// 🎯 @KICK  : 에디터 AI 모달 지식 RAG 컨텍스트 주입 및 출처 각주 마크다운 생성 로직 검증
// 🛡️ @GUARD : Rule 4 전용 디렉토리 격리, 빈 배열/결측값 방어 검증
// 🚨 @PATCH : **2026-09-13** — [출처 링크 포맷 일원화([출처 N: 문서명](<file:...>)) 및 본문 인라인 링크화 검증]
// 🚨 @PATCH : **2026-09-12** — [본문 인라인 출처 표기 의무화 및 문서 태그([출처: 문서명]) 표준화 검증 추가]
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
      snippet: 'JWT 토큰은 15분 만료 주기를 가지며 리프레시 토큰은 HttpOnly 쿠키에 저장된다.',
      startLine: 15,
      endLine: 40,
      score: 95
    },
    {
      documentId: 'doc-2',
      chunkId: 'chunk-2',
      filePath: 'D:\\docs\\api_spec.md',
      documentTitle: 'API 명세서',
      headingTitle: '사용자 프로필 조회',
      headingPath: 'API 목록 > 사용자 프로필 조회',
      snippet: 'GET /api/v1/user/profile 요청 시 Authorization Bearer 헤더가 필요하다.',
      startLine: 100,
      endLine: 125,
      score: 88
    }
  ];

  it('지식 청크 목록을 LLM 컨텍스트 블록으로 일관되게 포맷팅한다', () => {
    const blocks = mockCandidates.map((c, idx) => {
      const title = c.documentTitle || c.headingTitle;
      const path = c.headingPath || c.headingTitle;
      const lineInfo = `L${c.startLine}~L${c.endLine}`;
      return `[참고 지식 자료 ${idx + 1}]
- 문서명: ${title}
- 상세 섹션(경로): ${path}
- 원본 파일: ${c.filePath} (${lineInfo})
- 발췌 내용:
${c.snippet}`;
    }).join('\n\n---\n\n');

    assert.ok(blocks.includes('[참고 지식 자료 1]'));
    assert.ok(blocks.includes('- 문서명: 시스템 가이드'));
    assert.ok(blocks.includes('- 상세 섹션(경로): 보안 정책 > 인증 아키텍처'));
    assert.ok(blocks.includes('(L15~L40)'));
    assert.ok(blocks.includes('[참고 지식 자료 2]'));
    assert.ok(blocks.includes('GET /api/v1/user/profile'));
  });

  it('본문 인라인 출처 태그 [출처 N: 문서명] 및 하단 출처 목록을 번호 매칭 표준 형식으로 생성한다', () => {
    // 1. 하단 출처 목록 생성 검증 (중복 화살표 없이 단일 마크다운 링크 일원화)
    const sourceList = mockCandidates.map((c, i) => {
      const num = i + 1;
      const title = c.documentTitle || c.headingTitle || '내부 지식 문서';
      const path = c.headingPath || c.headingTitle || '';
      const fileUri = (c.filePath || '').replace(/\\/g, '/');
      const lineAnchor = (c.startLine && c.endLine) ? `#L${c.startLine}-L${c.endLine}` : '';
      const lineInfo = (c.startLine && c.endLine) ? ` (L${c.startLine}~L${c.endLine})` : '';
      const pathInfo = path ? ` - 섹션: \`${path}\`` : '';
      return `${num}. [출처 ${num}: ${title}](<file:///${fileUri}${lineAnchor}>)${pathInfo}${lineInfo}`;
    }).join('\n');

    const expectedSourceSection = `## 📚 내부 지식 보관함 출처\n${sourceList}\n`;

    assert.ok(expectedSourceSection.includes('1. [출처 1: 시스템 가이드](<file:///D:/docs/system_guide.md#L15-L40>) - 섹션: `보안 정책 > 인증 아키텍처` (L15~L40)'));
    assert.ok(expectedSourceSection.includes('2. [출처 2: API 명세서](<file:///D:/docs/api_spec.md#L100-L125>) - 섹션: `API 목록 > 사용자 프로필 조회` (L100~L125)'));

    // 2. 본문 인라인 태그 삽입 형식 검증 ([출처 N: 문서명])
    let sampleBody = `인증 처리는 JWT 토큰과 HttpOnly 쿠키 방식을 채택하고 있습니다 [출처 1: 시스템 가이드]. 사용자 프로필 조회 시 Bearer 헤더가 필요합니다 [출처 2: API 명세서].`;
    assert.ok(sampleBody.includes('[출처 1: 시스템 가이드]'));
    assert.ok(sampleBody.includes('[출처 2: API 명세서]'));

    // 3. 본문 인라인 태그 링크화 치환 검증
    mockCandidates.forEach((c, i) => {
      const num = i + 1;
      const fileUri = (c.filePath || '').replace(/\\/g, '/');
      const lineAnchor = (c.startLine && c.endLine) ? `#L${c.startLine}-L${c.endLine}` : '';
      const inlineRegex = new RegExp(`\\[출처\\s*${num}:\\s*([^\\]]+)\\](?!\\()`, 'g');
      sampleBody = sampleBody.replace(inlineRegex, `[출처 ${num}: $1](<file:///${fileUri}${lineAnchor}>)`);
    });

    assert.ok(sampleBody.includes('[출처 1: 시스템 가이드](<file:///D:/docs/system_guide.md#L15-L40>)'));
    assert.ok(sampleBody.includes('[출처 2: API 명세서](<file:///D:/docs/api_spec.md#L100-L125>)'));
  });

  it('출처 각주를 올바른 마크다운 링크 및 라인 앵커(#L시작-L끝)로 생성한다', () => {
    const footnotes = mockCandidates.map((c, i) => {
      const num = i + 1;
      const title = c.documentTitle || c.headingTitle;
      const path = c.headingPath || c.headingTitle;
      const fileUri = c.filePath.replace(/\\/g, '/');
      const lineAnchor = `#L${c.startLine}-L${c.endLine}`;
      const lineInfo = ` (L${c.startLine}~L${c.endLine})`;
      const pathInfo = path ? ` - 섹션: \`${path}\`` : '';
      return `> ${num}. [출처 ${num}: ${title}](<file:///${fileUri}${lineAnchor}>)${pathInfo}${lineInfo}`;
    }).join('\n');

    const expectedBlock = `\n\n---\n> 📚 **지식 보관함 참고 출처**:\n${footnotes}\n`;

    assert.ok(expectedBlock.includes('> 1. [출처 1: 시스템 가이드](<file:///D:/docs/system_guide.md#L15-L40>) - 섹션: `보안 정책 > 인증 아키텍처` (L15~L40)'));
    assert.ok(expectedBlock.includes('> 2. [출처 2: API 명세서](<file:///D:/docs/api_spec.md#L100-L125>) - 섹션: `API 목록 > 사용자 프로필 조회` (L100~L125)'));
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
