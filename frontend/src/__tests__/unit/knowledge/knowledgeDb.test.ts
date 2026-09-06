import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  initKnowledgeDatabase,
  getResourceKnowledgeDbPath,
  resolveSafeResourceFolder,
  syncDocumentChunksAtomic,
  upsertKnowledgeDocument,
  saveKnowledgeAnalysisAtomic,
  saveCompleteKnowledgeDocumentAtomic,
  getDocumentDetailFromDb,
  enqueueKnowledgeJob,
  getNextKnowledgeJob,
  updateJobStep,
  completeKnowledgeJob,
  cancelKnowledgeJob,
  retryFailedKnowledgeJobs,
  recoverStaleRunningJobs,
  getQueueStats,
  listKnowledgeJobs,
  getKnowledgeCollections,
  upsertKnowledgeCollection,
  deleteKnowledgeCollection
} from '../../../lib/knowledge/knowledgeDb.ts';
import type { DocumentChunk, KnowledgeAnalysisResult } from '../../../types/knowledge.ts';
import * as os from 'node:os';
import * as path from 'node:path';
import * as fs from 'node:fs';

describe('knowledgeDb', () => {
  it('브라우저 폴더명(Onrivi_Asset)을 루트 드라이브로 안전 승격하고 :memory: 및 절대 경로를 정확히 보존한다', () => {
    // 1. :memory: 특수 경로
    assert.strictEqual(resolveSafeResourceFolder(':memory:'), ':memory:');

    // 2. 이미 절대 경로인 경우
    const absPath = 'D:\\TestFolder';
    assert.strictEqual(resolveSafeResourceFolder(absPath), absPath);

    // 3. 브라우저가 전달한 단순 폴더명('Onrivi_Asset')은 루트 드라이브로 안전 승격
    const resolved = resolveSafeResourceFolder('Onrivi_Asset');
    assert.ok(path.isAbsolute(resolved));
    assert.strictEqual(path.basename(resolved), 'Onrivi_Asset');
    // 프로젝트 폴더 내부(cwd)가 아님을 검증
    assert.notStrictEqual(resolved, path.join(process.cwd(), 'Onrivi_Asset'));
  });

  it('리소스 폴더가 없으면 에러를 던지고, 있으면 resourceFolder/db/onrivi_knowledge.db 경로를 올바르게 반환한다', () => {
    // 1. 미지정 시 가드 확인
    assert.throws(() => {
      getResourceKnowledgeDbPath(null);
    }, /RESOURCE_FOLDER_NOT_SET/);

    assert.throws(() => {
      getResourceKnowledgeDbPath('');
    }, /RESOURCE_FOLDER_NOT_SET/);

    assert.throws(() => {
      getResourceKnowledgeDbPath('   ');
    }, /RESOURCE_FOLDER_NOT_SET/);

    // 2. 지정 시 경로 및 /db 하위 폴더 생성 확인
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'onrivi-res-'));
    try {
      const dbPath = getResourceKnowledgeDbPath(tmpDir);
      assert.strictEqual(path.basename(dbPath), 'onrivi_knowledge.db');
      assert.strictEqual(path.basename(path.dirname(dbPath)), 'db');
      assert.ok(fs.existsSync(path.join(tmpDir, 'db')));
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('인메모리 DB를 초기화하고 6대 스키마 및 FTS5를 생성한다', () => {
    const db = initKnowledgeDatabase(':memory:');
    assert.ok(db);

    const tables = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
    ).all() as { name: string }[];

    const tableNames = tables.map(t => t.name);
    assert.ok(tableNames.includes('knowledge_documents'));
    assert.ok(tableNames.includes('knowledge_collections'));
    assert.ok(tableNames.includes('document_tags'));
    assert.ok(tableNames.includes('document_chunks'));
    assert.ok(tableNames.includes('document_chunks_fts'));
    assert.ok(tableNames.includes('knowledge_jobs'));
  });

  it('문서 등록, 청크 원자적 동기화 및 FTS5 검색이 정상 동작한다', () => {
    const db = initKnowledgeDatabase(':memory:');

    // 1. 문서 등록
    upsertKnowledgeDocument(db, {
      id: 'doc_test_1',
      filePath: 'docs/auth.md',
      title: '인증 아키텍처',
      fileHash: 'hash_123',
      fileSize: 1024,
      modifiedAt: new Date().toISOString(),
      priority: 5,
      status: 'REGISTERED'
    });

    const doc = db.prepare('SELECT * FROM knowledge_documents WHERE id = ?').get('doc_test_1') as any;
    assert.strictEqual(doc.title, '인증 아키텍처');
    assert.strictEqual(doc.priority, 5);
    assert.strictEqual(doc.status, 'REGISTERED');

    // 2. 청크 동기화
    const chunks: DocumentChunk[] = [
      {
        id: 'chunk_1',
        documentId: 'doc_test_1',
        chunkIndex: 0,
        headingTitle: 'JWT 인증 방식',
        headingLevel: 2,
        headingPath: '인증 아키텍처 > JWT 인증 방식',
        startLine: 1,
        endLine: 20,
        chunkSummary: 'JWT 토큰 발급 및 서명 검증',
        keywords: 'JWT, 토큰, 인증, Session, 보안',
        chunkText: '클라이언트 로그인 시 JWT 토큰을 발급하고 쿠키에 저장합니다.'
      }
    ];

    syncDocumentChunksAtomic(db, 'doc_test_1', chunks);

    const chunkRow = db.prepare('SELECT * FROM document_chunks WHERE id = ?').get('chunk_1') as any;
    assert.strictEqual(chunkRow.heading_title, 'JWT 인증 방식');
    assert.strictEqual(chunkRow.heading_path, '인증 아키텍처 > JWT 인증 방식');

    // 3. FTS5 검색 검증
    const ftsResults = db.prepare(
      "SELECT chunk_id, heading_title, bm25(document_chunks_fts) as score FROM document_chunks_fts WHERE document_chunks_fts MATCH 'JWT OR 토큰'"
    ).all() as any[];

    assert.strictEqual(ftsResults.length, 1);
    assert.strictEqual(ftsResults[0].chunk_id, 'chunk_1');
    assert.ok(typeof ftsResults[0].score === 'number');

    // 4. AI 분석 결과 반영 원자적 저장 검증
    const analysis: KnowledgeAnalysisResult = {
      summary: 'JWT 인증 체계와 토큰 라이프사이클을 설명하는 문서입니다.',
      keyPoints: ['JWT 기반 무상태 인증', '리프레시 토큰 로테이션'],
      documentType: 'technical',
      tags: [
        { name: '인증', score: 95 },
        { name: 'JWT', score: 92 },
        { name: '보안', score: 88 }
      ],
      searchTerms: ['로그인', '토큰', 'OAuth']
    };

    saveKnowledgeAnalysisAtomic(db, 'doc_test_1', analysis, 'gemini-flash');

    const updatedDoc = db.prepare('SELECT * FROM knowledge_documents WHERE id = ?').get('doc_test_1') as any;
    assert.strictEqual(updatedDoc.status, 'READY');
    assert.strictEqual(updatedDoc.document_type, 'technical');

    const tags = db.prepare('SELECT * FROM document_tags WHERE document_id = ? ORDER BY score DESC').all('doc_test_1') as any[];
    assert.strictEqual(tags.length, 3);
    assert.strictEqual(tags[0].tag_name, '인증');
    assert.strictEqual(tags[0].score, 95);
  });

  it('문서 마스터, 청크, FTS5, 태그를 단일 원트랜잭션(All-or-Nothing)으로 원자적 저장하고 오류 시 완전 롤백한다', () => {
    const db = initKnowledgeDatabase(':memory:');

    // 정상 원트랜잭션 저장 검증
    const chunks: DocumentChunk[] = [
      {
        id: 'chunk_atomic_1',
        documentId: 'doc_atomic_1',
        chunkIndex: 0,
        headingTitle: '원트랜잭션 테스트',
        headingLevel: 1,
        headingPath: '원트랜잭션 테스트',
        startLine: 1,
        endLine: 10,
        chunkSummary: '원자적 트랜잭션 무결성 검증',
        keywords: '트랜잭션, SQLite, 무결성',
        chunkText: '모든 데이터는 단일 트랜잭션으로 커밋되어야 합니다.'
      }
    ];

    const analysis: KnowledgeAnalysisResult = {
      summary: '원트랜잭션 무결성 문서입니다.',
      keyPoints: ['단일 트랜잭션 보장', '비정상 데이터 적재 방어'],
      documentType: 'technical',
      tags: [{ name: '무결성', score: 99 }],
      searchTerms: ['트랜잭션', '원자성']
    };

    saveCompleteKnowledgeDocumentAtomic(db, {
      document: {
        id: 'doc_atomic_1',
        filePath: 'docs/atomic.md',
        title: '원트랜잭션 문서',
        fileHash: 'hash_atomic',
        fileSize: 512,
        modifiedAt: new Date().toISOString(),
        priority: 5,
      },
      chunks,
      analysis,
      analyzerModel: 'gemini-3.8-flash',
    });

    // 1. 성공 시 모든 테이블에 READY 상태로 완벽히 적재되었는지 확인
    const docRow = db.prepare('SELECT * FROM knowledge_documents WHERE id = ?').get('doc_atomic_1') as any;
    assert.ok(docRow);
    assert.strictEqual(docRow.status, 'READY');
    assert.strictEqual(docRow.summary, '원트랜잭션 무결성 문서입니다.');

    const chunkRows = db.prepare('SELECT * FROM document_chunks WHERE document_id = ?').all('doc_atomic_1') as any[];
    assert.strictEqual(chunkRows.length, 1);

    const ftsRows = db.prepare("SELECT * FROM document_chunks_fts WHERE document_chunks_fts MATCH '원자성 OR 트랜잭션'").all() as any[];
    assert.strictEqual(ftsRows.length, 1);

    const tagRows = db.prepare('SELECT * FROM document_tags WHERE document_id = ?').all('doc_atomic_1') as any[];
    assert.strictEqual(tagRows.length, 1);
    assert.strictEqual(tagRows[0].tag_name, '무결성');

    // 2. 오류 발생 시 완전 롤백(Clean Rollback) 검증: 태그 score CHECK 위반(score 150) 유도
    assert.throws(() => {
      saveCompleteKnowledgeDocumentAtomic(db, {
        document: {
          id: 'doc_fail_1',
          filePath: 'docs/fail.md',
          title: '실패 유도 문서',
          fileHash: 'hash_fail',
          fileSize: 256,
          modifiedAt: new Date().toISOString(),
        },
        chunks: [
          {
            id: 'chunk_fail_1',
            documentId: 'doc_fail_1',
            chunkIndex: 0,
            headingTitle: '실패 헤딩',
            headingLevel: 1,
            headingPath: '실패 헤딩',
            startLine: 1,
            endLine: 5,
            chunkText: '실패 청크 내용'
          }
        ],
        analysis: {
          summary: '실패 요약',
          keyPoints: [],
          documentType: 'other',
          tags: [{ name: '잘못된태그', score: 150 }], // CHECK(score BETWEEN 0 AND 100) 위반!
          searchTerms: []
        },
        analyzerModel: 'gemini-3.8-flash'
      });
    });

    // 실패한 문서는 DB의 어떤 테이블에도 단 1건도 남지 않아야 함 (완전 무결성 보장)
    const failedDoc = db.prepare('SELECT * FROM knowledge_documents WHERE id = ?').get('doc_fail_1');
    assert.strictEqual(failedDoc, undefined);

    const failedChunks = db.prepare('SELECT * FROM document_chunks WHERE document_id = ?').all('doc_fail_1');
    assert.strictEqual(failedChunks.length, 0);

    const failedTags = db.prepare('SELECT * FROM document_tags WHERE document_id = ?').all('doc_fail_1');
    assert.strictEqual(failedTags.length, 0);
  });

  it('getDocumentDetailFromDb로 등록된 문서의 청크 계층, 라인 범위, 키워드, 태그 상세를 완벽히 조회한다', () => {
    const db = initKnowledgeDatabase(':memory:');

    saveCompleteKnowledgeDocumentAtomic(db, {
      document: {
        id: 'doc_detail_sample_1',
        filePath: 'docs/test_manual.md',
        title: '테스트 매뉴얼',
        fileHash: 'hash_detail_1',
        fileSize: 4096,
        modifiedAt: new Date().toISOString(),
      },
      chunks: [
        {
          id: 'chunk_dt_1',
          documentId: 'doc_detail_sample_1',
          chunkIndex: 0,
          headingTitle: '개요',
          headingLevel: 1,
          headingPath: '개요',
          startLine: 1,
          endLine: 15,
          chunkSummary: '매뉴얼의 개요 설명',
          keywords: '매뉴얼, 시작, 온리비',
          chunkText: '# 개요\n\n이것은 온리비 지식 엔진 매뉴얼입니다.'
        },
        {
          id: 'chunk_dt_2',
          documentId: 'doc_detail_sample_1',
          chunkIndex: 1,
          headingTitle: '상세 설정',
          headingLevel: 2,
          headingPath: '개요 > 상세 설정',
          startLine: 16,
          endLine: 35,
          chunkSummary: '상세 옵션 및 파라미터',
          keywords: '옵션, 파라미터, 설정',
          chunkText: '## 상세 설정\n\n여러 옵션을 구성할 수 있습니다.'
        }
      ],
      analysis: {
        summary: '온리비 매뉴얼 종합 요약본입니다.',
        keyPoints: ['원트랜잭션 저장', '헤딩 청킹'],
        documentType: 'DOCUMENTATION',
        tags: [
          { name: '매뉴얼', score: 95 },
          { name: '설정', score: 80 }
        ],
        searchTerms: ['온리비 매뉴얼', '설정 방법']
      },
      analyzerModel: 'gemini-3.8-flash'
    });

    const detail = getDocumentDetailFromDb(db, { documentId: 'doc_detail_sample_1' });
    assert.ok(detail !== null);
    assert.strictEqual(detail.documentId, 'doc_detail_sample_1');
    assert.strictEqual(detail.title, '테스트 매뉴얼');
    assert.strictEqual(detail.status, 'READY');
    assert.strictEqual(detail.summary, '온리비 매뉴얼 종합 요약본입니다.');
    assert.deepStrictEqual(detail.keyPoints, ['원트랜잭션 저장', '헤딩 청킹']);
    assert.strictEqual(detail.chunksCount, 2);
    assert.strictEqual(detail.chunks[0].startLine, 1);
    assert.strictEqual(detail.chunks[0].endLine, 15);
    assert.strictEqual(detail.chunks[0].headingPath, '개요');
    assert.ok(detail.chunks[0].chunkText.includes('이것은 온리비 지식 엔진 매뉴얼입니다.'));
    assert.strictEqual(detail.tags.length, 2);
    assert.strictEqual(detail.tags[0].name, '매뉴얼');
    assert.strictEqual(detail.tags[0].score, 95);
  });

  it('지식 컬렉션의 생성, 조회, 삭제 시 연결된 문서의 외래키가 안전하게 NULL 처리된다', () => {
    const db = initKnowledgeDatabase(':memory:');

    // 1. 컬렉션 생성
    const col = upsertKnowledgeCollection(db, {
      name: '기술 문서',
      description: 'API 및 설계 문서',
      color: '#4D73FF'
    });
    assert.strictEqual(col.name, '기술 문서');
    assert.strictEqual(col.color, '#4D73FF');

    const collections = getKnowledgeCollections(db);
    assert.strictEqual(collections.length, 1);
    assert.strictEqual(collections[0].name, '기술 문서');

    // 2. 문서에 컬렉션 바인딩
    db.prepare(`
      INSERT INTO knowledge_documents (
        id, collection_id, file_path, title, file_hash, file_size, modified_at,
        status, analysis_version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'READY', 1)
    `).run('doc_col_1', col.id, 'docs/test.md', '테스트', 'hash_col', 100, new Date().toISOString());

    // 3. 컬렉션 삭제 시 문서의 collection_id가 NULL로 안전 해제됨
    deleteKnowledgeCollection(db, col.id);
    const updatedDoc = db.prepare('SELECT collection_id FROM knowledge_documents WHERE id = ?').get('doc_col_1') as any;
    assert.strictEqual(updatedDoc.collection_id, null);
    assert.strictEqual(getKnowledgeCollections(db).length, 0);
  });

  it('로컬 작업 큐에서 중복 등록 억제(Suppression), 우선순위 선점, 지수 백오프 및 비정상 종료 복구가 완벽 동작한다', () => {
    const db = initKnowledgeDatabase(':memory:');

    // 1. Job 큐잉
    const job1 = enqueueKnowledgeJob(db, {
      documentId: 'doc_q_1',
      filePath: 'docs/auth.md',
      title: '인증 문서',
      targetHash: 'hash_auth_v1',
      priority: 3
    });
    assert.ok(job1 !== null);
    assert.strictEqual(job1.status, 'QUEUED');

    // 2. 동일 경로 + 동일 해시 중복 큐잉 시 Duplicate Job Suppression으로 차단 (null 반환)
    const duplicateJob = enqueueKnowledgeJob(db, {
      documentId: 'doc_q_1',
      filePath: 'docs/auth.md',
      title: '인증 문서',
      targetHash: 'hash_auth_v1',
      priority: 5
    });
    assert.strictEqual(duplicateJob, null, '동일 파일과 해시의 작업은 중복 큐잉되지 않아야 함');

    // 3. 더 높은 우선순위(5)를 가진 다른 작업 등록
    const job2 = enqueueKnowledgeJob(db, {
      documentId: 'doc_q_2',
      filePath: 'docs/important.md',
      title: '중요 문서',
      targetHash: 'hash_imp_v1',
      priority: 5
    });
    assert.ok(job2 !== null);

    // 4. 우선순위 높은 job2가 먼저 선점(RUNNING)되어야 함
    const nextJob = getNextKnowledgeJob(db);
    assert.ok(nextJob !== null);
    assert.strictEqual(nextJob.id, job2.id);
    assert.strictEqual(nextJob.status, 'RUNNING');
    assert.strictEqual(nextJob.currentStep, 'HASH');

    // 5. 작업 단계 업데이트
    updateJobStep(db, nextJob.id, 'CHUNK');
    const runningJob = db.prepare('SELECT current_step FROM knowledge_jobs WHERE id = ?').get(nextJob.id) as any;
    assert.strictEqual(runningJob.current_step, 'CHUNK');

    // 6. 실패 및 지수 백오프(재시도 예약)
    completeKnowledgeJob(db, nextJob.id, {
      success: false,
      errorLog: 'HTTP 429 Rate Limit',
      backoffSeconds: 10
    });
    const backoffJob = db.prepare('SELECT status, retry_count, retry_after FROM knowledge_jobs WHERE id = ?').get(nextJob.id) as any;
    assert.strictEqual(backoffJob.status, 'QUEUED');
    assert.strictEqual(backoffJob.retry_count, 1);
    assert.ok(backoffJob.retry_after !== null);

    // 7. 아직 남은 job1 선점
    const job1Popped = getNextKnowledgeJob(db);
    assert.ok(job1Popped !== null);
    assert.strictEqual(job1Popped.id, job1.id);

    // 8. 앱 비정상 종료 시 RUNNING 상태를 QUEUED로 복구
    const recoveredCount = recoverStaleRunningJobs(db);
    assert.strictEqual(recoveredCount, 1);

    const stats = getQueueStats(db);
    assert.strictEqual(stats.total, 2);
    assert.strictEqual(stats.queued, 2);
    assert.strictEqual(stats.running, 0);
  });

  it('REINDEX 작업 등록 시 사전 등록된 지식 문서만 허용하고 미등록 문서는 원천 거부한다', () => {
    const db = initKnowledgeDatabase(':memory:');

    // 1. 미등록 문서에 대해 REINDEX 요청 시 차단(null 반환)
    const unregisteredJob = enqueueKnowledgeJob(db, {
      documentId: 'doc_unregistered_1',
      filePath: 'docs/unregistered.md',
      title: '미등록 문서',
      jobType: 'REINDEX',
      targetHash: 'hash_unreg_1',
      priority: 1
    });
    assert.strictEqual(unregisteredJob, null, '미등록 문서는 REINDEX 큐에 등록될 수 없음');

    // 2. 지식 보관함에 정상 문서 등록
    saveCompleteKnowledgeDocumentAtomic(db, {
      document: {
        id: 'doc_reg_1',
        filePath: 'docs/registered.md',
        title: '등록된 지식 문서',
        fileHash: 'hash_reg_v1',
        fileSize: 1024,
        modifiedAt: new Date().toISOString()
      },
      chunks: [],
      analysis: {
        summary: '등록 문서 요약',
        keyPoints: [],
        documentType: 'guide',
        tags: [],
        searchTerms: []
      }
    });

    // 3. 등록된 문서에 대해 REINDEX 요청 시 정상 큐잉 (P1)
    const registeredJob = enqueueKnowledgeJob(db, {
      documentId: 'doc_reg_1',
      filePath: 'docs/registered.md',
      title: '등록된 지식 문서',
      jobType: 'REINDEX',
      targetHash: 'hash_reg_v2',
      priority: 1
    });
    assert.ok(registeredJob !== null);
    assert.strictEqual(registeredJob.jobType, 'REINDEX');
    assert.strictEqual(registeredJob.priority, 1);
    assert.strictEqual(registeredJob.status, 'QUEUED');
  });
});

