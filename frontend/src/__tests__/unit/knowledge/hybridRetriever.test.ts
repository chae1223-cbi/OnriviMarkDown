import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  normalizeCandidateBm25,
  buildFtsQuery,
  retrieveKnowledgeCandidates
} from '../../../lib/knowledge/hybridRetriever.ts';
import {
  initKnowledgeDatabase,
  upsertKnowledgeDocument,
  syncDocumentChunksAtomic,
  saveKnowledgeAnalysisAtomic
} from '../../../lib/knowledge/knowledgeDb.ts';

describe('hybridRetriever', () => {
  it('후보군 내 BM25 점수를 0~100 스케일로 상대 정규화한다', () => {
    // FTS5는 작을수록(음수일수록) 좋은 점수
    const candidates = [
      { rawBm25: -10 }, // Best -> 100
      { rawBm25: -5 },  // Middle -> 50
      { rawBm25: 0 },   // Worst -> 0
    ];

    const scores = normalizeCandidateBm25(candidates);
    assert.strictEqual(scores[0], 100);
    assert.strictEqual(scores[1], 50);
    assert.strictEqual(scores[2], 0);

    // 단일 후보인 경우 100 반환
    assert.deepStrictEqual(normalizeCandidateBm25([{ rawBm25: -4 }]), [100]);
    assert.deepStrictEqual(normalizeCandidateBm25([]), []);
  });

  it('사용자 검색어를 FTS5 구문으로 정확하게 생성한다', () => {
    const fts = buildFtsQuery('JWT 인증');
    assert.ok(fts.includes('"JWT 인증"'));
    assert.ok(fts.includes('"JWT"*'));
    assert.ok(fts.includes('"인증"*'));
  });

  it('하이브리드 검색 시 가중치가 반영되어 점수 순으로 후보군을 반환한다', () => {
    const db = initKnowledgeDatabase(':memory:');

    // 문서 1: JWT 인증 (우선순위 5)
    upsertKnowledgeDocument(db, {
      id: 'doc_auth',
      filePath: 'docs/auth.md',
      title: '인증 아키텍처',
      fileHash: 'h1',
      fileSize: 1000,
      modifiedAt: new Date().toISOString(),
      priority: 5,
      status: 'READY'
    });

    syncDocumentChunksAtomic(db, 'doc_auth', [
      {
        id: 'chunk_auth_1',
        documentId: 'doc_auth',
        chunkIndex: 0,
        headingTitle: 'JWT 토큰 인증',
        headingLevel: 2,
        headingPath: '인증 > JWT 토큰 인증',
        startLine: 1,
        endLine: 20,
        chunkText: 'JWT 토큰 발급 및 서명 검증 방식입니다.'
      }
    ]);

    saveKnowledgeAnalysisAtomic(db, 'doc_auth', {
      summary: 'JWT 인증 가이드',
      keyPoints: ['토큰 발급'],
      documentType: 'technical',
      tags: [{ name: '인증', score: 95 }],
      searchTerms: ['JWT', '토큰']
    });

    // 문서 2: 회의록 (우선순위 2)
    upsertKnowledgeDocument(db, {
      id: 'doc_meeting',
      filePath: 'docs/meeting.md',
      title: '개발 회의록',
      fileHash: 'h2',
      fileSize: 500,
      modifiedAt: new Date().toISOString(),
      priority: 2,
      status: 'READY'
    });

    syncDocumentChunksAtomic(db, 'doc_meeting', [
      {
        id: 'chunk_meeting_1',
        documentId: 'doc_meeting',
        chunkIndex: 0,
        headingTitle: '기타 안건',
        headingLevel: 2,
        headingPath: '회의 > 기타 안건',
        startLine: 1,
        endLine: 10,
        chunkText: '다음 주에 인증 관련 논의를 진행합니다.'
      }
    ]);

    saveKnowledgeAnalysisAtomic(db, 'doc_meeting', {
      summary: '회의록',
      keyPoints: ['일정 조율'],
      documentType: 'meeting',
      tags: [{ name: '회의', score: 40 }],
      searchTerms: []
    });

    // 검색 실행: "JWT 인증"
    const results = retrieveKnowledgeCandidates(db, { query: 'JWT 인증' });

    assert.ok(results.length >= 1);
    assert.strictEqual(results[0].chunkId, 'chunk_auth_1');
    assert.strictEqual(results[0].documentTitle, '인증 아키텍처');
    assert.ok(results[0].finalScore > 0);
  });
});
