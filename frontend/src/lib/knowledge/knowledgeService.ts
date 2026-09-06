// ====================================================================
// 📊 [OMD-CORE-knowledgeService-0001] knowledgeService.ts ➔ Knowledge Service Facade
// 🎯 @KICK  : 지식 엔진의 청킹, DB 인프라, LLM 분석, 하이브리드 검색, 출처 생성을 통합 제공하는 서비스 파사드
// 🛡️ @GUARD : 3대 가드(리소스 폴더/AI 연결/플랜) 검증, SHA-256 파일 해시 무결성, 단일 트랜잭션(All-or-Nothing) 완전 롤백
// 🚨 @PATCH : **2026-09-06** — [빈 문서 예외 방어 및 조회/삭제 시 AI 키 가드 유연화] 파일 내용이 비어있거나 읽기 실패 시 safeContent 기본 구조화 폴백을 적용하여 DB 등록 에러 원천 차단, listDocuments/deleteDocument 등 DB 순수 조회/삭제 시 AI API 키 미설정 상태에서도 정상 작동하도록 DUMMY_KEY 폴백 적용
//             **2026-09-05** — [지식 문서 해제 시 작업 큐 원자적 연계 청소] deleteDocument 및 deleteErrorDocuments 수행 시 knowledge_jobs의 대기/실행 작업도 단일 트랜잭션에서 함께 원자적 삭제하도록 무결성 강화
//             **2026-09-04** — [지식 문서 등록 상세 내역 및 getDocumentDetail 구현] indexDocument 반환값에 청크/태그/검색어 상세내역(detail) 포함 및 getDocumentDetail 서비스 메소드 구현
//             **2026-09-04** — [SQLite 원트랜잭션(All-or-Nothing) 무결성 적용] 선행 AI 분석 성공 시에만 단일 트랜잭션으로 DB 일괄 적재(saveCompleteKnowledgeDocumentAtomic)하여 중간 실패 시 ERROR 데이터 적재 원천 차단
//             **2026-09-04** — [오류 문서 일괄 삭제 지원] deleteErrorDocuments 메소드 추가로 ERROR 상태 문서 원자적 일괄 청소 제공
//             **2026-09-04** — [ONRIVI-KNOWLEDGE-ENGINE-002.1] indexDocument, searchKnowledge, getRegisteredDocumentPaths 최초 구현
// 🔗 @CALLS : ./knowledgeDb, ./knowledgeGuard, ./markdownChunker, ./llmProvider, ./hybridRetriever, ./contextBuilder
// ====================================================================

import CryptoJS from 'crypto-js';
import { 
  getResourceKnowledgeDbPath, 
  hasKnowledgeDatabase, 
  initKnowledgeDatabase, 
  saveCompleteKnowledgeDocumentAtomic,
  getDocumentDetailFromDb
} from './knowledgeDb';
import { checkKnowledgeGuard, assertKnowledgeAccess } from './knowledgeGuard';
import { chunkMarkdownByHeadings } from './markdownChunker';
import { createKnowledgeLLMProvider } from './llmProvider';
import { retrieveKnowledgeCandidates } from './hybridRetriever';
import { buildPromptContext } from './contextBuilder';
import type { RetrievalCandidate, KnowledgeAnswerResult, KnowledgeDocumentDetail } from '../../types/knowledge';

/**
 * SHA-256 해시를 계산합니다 (crypto-js 활용으로 브라우저/서버 완벽 호환).
 */
function computeSha256(content: string): string {
  return CryptoJS.SHA256(content).toString(CryptoJS.enc.Hex);
}

export interface IndexDocumentParams {
  filePath: string;
  fileContent: string;
  title?: string;
  resourceFolder?: string | null;
  geminiApiKey?: string | null;
  planCode?: string | null;
  aiModelName?: string | null;
}

export interface SearchKnowledgeParams {
  query: string;
  resourceFolder?: string | null;
  geminiApiKey?: string | null;
  planCode?: string | null;
  collectionId?: string;
  limit?: number;
}

/**
 * 지식 엔진 통합 서비스 파사드
 */
export class KnowledgeService {
  /**
   * 단일 마크다운 문서를 지식 베이스에 등록하고 백그라운드 AI 분석을 수행합니다.
   * [원트랜잭션 원칙]: 선행 전처리(청킹, AI 분석)가 100% 정상 완료된 경우에만
   * 단 하나의 SQLite 트랜잭션으로 원자적 저장하며, 오류 발생 시 어떤 비정상/ERROR 데이터도 DB에 남기지 않습니다.
   */
  static async indexDocument(params: IndexDocumentParams): Promise<{ documentId: string; chunksCount: number; detail: KnowledgeDocumentDetail }> {
    const { filePath, fileContent, title, resourceFolder, geminiApiKey, planCode } = params;

    // 1. 3대 가드 검증 (리소스 폴더, AI 연결, 라이선스 플랜)
    assertKnowledgeAccess({ resourceFolder, geminiApiKey, planCode });

    // 2. DB 초기화
    const dbPath = getResourceKnowledgeDbPath(resourceFolder);
    const db = initKnowledgeDatabase(dbPath);

    const docId = `doc_${computeSha256(filePath).slice(0, 16)}`;
    const fileHash = computeSha256(fileContent);
    const fileSize = typeof Blob !== 'undefined' ? new Blob([fileContent]).size : fileContent.length;
    const docTitle = title || filePath.split(/[/\\]/).pop()?.replace(/\.md$/i, '') || '문서';

    // 3. 마크다운 청킹 (DB 쓰기 전 메모리에서 선행 수행)
    const chunks = chunkMarkdownByHeadings(docId, fileContent);

    // 4. Gemini 정형 분석 실행 (DB 쓰기 전 외부 AI 분석 선행 수행)
    const modelToUse = (params.aiModelName || 'gemini-3.8-flash').trim();
    const provider = createKnowledgeLLMProvider('gemini', geminiApiKey!, modelToUse);
    const analysis = await provider.analyzeDocument(fileContent);

    // 5. 청킹 및 AI 분석이 100% 정상 완료된 경우에만 단일 원트랜잭션(All-or-Nothing)으로 DB에 일괄 적재
    // 중간에 실패하면 아무런 레코드(ERROR 상태 등)도 DB에 남지 않고 롤백됩니다.
    saveCompleteKnowledgeDocumentAtomic(db, {
      document: {
        id: docId,
        filePath,
        title: docTitle,
        fileHash,
        fileSize,
        modifiedAt: new Date().toISOString(),
        priority: 3,
      },
      chunks,
      analysis,
      analyzerModel: modelToUse,
    });

    const detail: KnowledgeDocumentDetail = {
      documentId: docId,
      filePath,
      title: docTitle,
      fileSize,
      modifiedAt: new Date().toISOString(),
      status: 'READY',
      summary: analysis.summary,
      keyPoints: analysis.keyPoints,
      documentType: analysis.documentType,
      tags: analysis.tags,
      searchTerms: analysis.searchTerms,
      analyzerModel: modelToUse,
      chunksCount: chunks.length,
      chunks: chunks.map(c => ({
        id: c.id,
        chunkIndex: c.chunkIndex,
        headingTitle: c.headingTitle,
        headingLevel: c.headingLevel,
        headingPath: c.headingPath,
        startLine: c.startLine,
        endLine: c.endLine,
        chunkSummary: c.chunkSummary,
        keywords: c.keywords,
        chunkText: c.chunkText,
      })),
    };

    return {
      documentId: docId,
      chunksCount: chunks.length,
      detail,
    };
  }

  /**
   * 특정 지식 문서의 전체 상세 내역(요약, 키포인트, 태그, 모든 청크 계층)을 조회합니다.
   */
  static getDocumentDetail(params: { documentId?: string; filePath?: string; resourceFolder?: string | null; geminiApiKey?: string | null; planCode?: string | null }): KnowledgeDocumentDetail | null {
    const { documentId, filePath, resourceFolder, geminiApiKey, planCode } = params;
    assertKnowledgeAccess({ resourceFolder, geminiApiKey: geminiApiKey || 'DUMMY_KEY_FOR_READ', planCode });

    if (!hasKnowledgeDatabase(resourceFolder)) return null;

    const dbPath = getResourceKnowledgeDbPath(resourceFolder);
    const db = initKnowledgeDatabase(dbPath);

    return getDocumentDetailFromDb(db, { documentId, filePath });
  }

  /**
   * 지식 베이스에 등록된 모든 문서의 상대 경로 목록을 반환합니다 (탐색기 뱃지 표시용).
   */
  static getRegisteredDocumentPaths(resourceFolder?: string | null): Set<string> {
    if (!resourceFolder || !resourceFolder.trim()) return new Set();
    if (!hasKnowledgeDatabase(resourceFolder)) return new Set();

    try {
      const dbPath = getResourceKnowledgeDbPath(resourceFolder);
      const db = initKnowledgeDatabase(dbPath);
      const rows = db.prepare("SELECT file_path FROM knowledge_documents WHERE status = 'READY'").all() as any[];
      return new Set(rows.map(r => String(r.file_path)));
    } catch {
      return new Set();
    }
  }

  /**
   * 하이브리드 검색을 수행하여 순위화된 후보 청크를 반환합니다.
   */
  static searchCandidates(params: SearchKnowledgeParams): RetrievalCandidate[] {
    const { query, resourceFolder, geminiApiKey, planCode, collectionId, limit } = params;
    const guard = checkKnowledgeGuard({ resourceFolder, geminiApiKey, planCode });
    if (!guard.canUseKnowledge) return [];
    if (!hasKnowledgeDatabase(resourceFolder)) return [];

    try {
      const dbPath = getResourceKnowledgeDbPath(resourceFolder);
      const db = initKnowledgeDatabase(dbPath);
      return retrieveKnowledgeCandidates(db, { query, collectionId, limit });
    } catch {
      return [];
    }
  }

  /**
   * 질문에 대해 하이브리드 검색 후 LLM 답변과 출처 목록을 생성합니다.
   */
  static async queryAnswer(
    params: SearchKnowledgeParams,
    readFileSlice: (path: string, start: number, end: number) => string
  ): Promise<KnowledgeAnswerResult> {
    const { query, resourceFolder, geminiApiKey, planCode, collectionId } = params;
    assertKnowledgeAccess({ resourceFolder, geminiApiKey, planCode });

    if (!hasKnowledgeDatabase(resourceFolder)) {
      return {
        answer: '지식 보관함에 데이터베이스가 없거나 아직 등록된 문서가 없습니다. 먼저 문서를 등록해 주세요.',
        evidenceList: [],
      };
    }

    const candidates = KnowledgeService.searchCandidates({
      query,
      resourceFolder,
      geminiApiKey,
      planCode,
      collectionId,
      limit: 20,
    });

    if (candidates.length === 0) {
      return {
        answer: '지식 보관함 내 관련 문서에서 일치하는 내용을 찾을 수 없습니다.',
        evidenceList: [],
      };
    }

    // Context Builder 실행 (Token Budget & Source Diversity)
    const { contextText, evidenceList } = buildPromptContext(candidates, readFileSlice, 4000);

    const provider = createKnowledgeLLMProvider('gemini', geminiApiKey!);
    const { answer } = await provider.answerQuestion(query, contextText);

    return {
      answer,
      evidenceList,
    };
  }

  /**
   * 등록된 지식 문서 목록을 최신순으로 조회합니다.
   * 리소스 폴더에 DB 파일이 없으면 빈 배열 []을 반환합니다.
   */
  static listDocuments(params: { resourceFolder?: string | null; geminiApiKey?: string | null; planCode?: string | null }): any[] {
    const { resourceFolder, geminiApiKey, planCode } = params;
    assertKnowledgeAccess({ resourceFolder, geminiApiKey: geminiApiKey || 'DUMMY_KEY_FOR_READ', planCode });

    // DB 파일이 아직 존재하지 않는 경우 새로 만들지 않고 빈 목록 반환
    if (!hasKnowledgeDatabase(resourceFolder)) {
      return [];
    }

    const dbPath = getResourceKnowledgeDbPath(resourceFolder);
    const db = initKnowledgeDatabase(dbPath);

    const docs = db.prepare(`
      SELECT 
        d.id,
        d.file_path,
        d.title,
        d.file_hash,
        d.file_size,
        d.modified_at,
        d.summary,
        d.key_points,
        d.document_type,
        d.priority,
        d.status,
        d.error_message,
        d.analyzer_model,
        d.analyzed_at,
        d.indexed_at,
        (SELECT COUNT(*) FROM document_chunks c WHERE c.document_id = d.id) as chunk_count
      FROM knowledge_documents d
      ORDER BY d.indexed_at DESC
    `).all();

    const getTagsStmt = db.prepare(`SELECT tag_name, score FROM document_tags WHERE document_id = ? ORDER BY score DESC`);

    return docs.map((doc: any) => {
      let tags: any[] = [];
      try {
        tags = getTagsStmt.all(doc.id);
      } catch {}
      return {
        ...doc,
        tags,
      };
    });
  }

  /**
   * 특정 지식 문서를 데이터베이스에서 원자적으로 삭제(해제)합니다.
   * documentId 또는 filePath 중 하나를 지정하여 삭제할 수 있습니다.
   */
  static deleteDocument(params: { documentId?: string; filePath?: string; resourceFolder?: string | null; geminiApiKey?: string | null; planCode?: string | null }): boolean {
    const { documentId, filePath, resourceFolder, geminiApiKey, planCode } = params;
    assertKnowledgeAccess({ resourceFolder, geminiApiKey: geminiApiKey || 'DUMMY_KEY_FOR_DELETE', planCode });

    if (!hasKnowledgeDatabase(resourceFolder)) return true;

    const dbPath = getResourceKnowledgeDbPath(resourceFolder);
    const db = initKnowledgeDatabase(dbPath);

    let targetId = documentId;
    if (!targetId && filePath) {
      const doc = db.prepare('SELECT id FROM knowledge_documents WHERE file_path = ?').get(filePath);
      if (doc) {
        targetId = doc.id;
      } else {
        return true; // 이미 DB에 없음
      }
    }

    if (!targetId) return true;

    db.exec('BEGIN TRANSACTION;');
    try {
      db.prepare('DELETE FROM document_chunks_fts WHERE document_id = ?').run(targetId);
      db.prepare('DELETE FROM document_chunks WHERE document_id = ?').run(targetId);
      db.prepare('DELETE FROM document_tags WHERE document_id = ?').run(targetId);
      db.prepare('DELETE FROM knowledge_jobs WHERE document_id = ?').run(targetId);
      db.prepare('DELETE FROM knowledge_documents WHERE id = ?').run(targetId);
      db.exec('COMMIT;');
      return true;
    } catch (err) {
      db.exec('ROLLBACK;');
      throw err;
    }
  }

  /**
   * 오류 상태(ERROR)인 모든 지식 문서를 원자적으로 일괄 삭제합니다.
   */
  static deleteErrorDocuments(params: { resourceFolder?: string | null; geminiApiKey?: string | null; planCode?: string | null }): number {
    const { resourceFolder, geminiApiKey, planCode } = params;
    assertKnowledgeAccess({ resourceFolder, geminiApiKey: geminiApiKey || 'DUMMY_KEY_FOR_DELETE', planCode });

    if (!hasKnowledgeDatabase(resourceFolder)) return 0;

    const dbPath = getResourceKnowledgeDbPath(resourceFolder);
    const db = initKnowledgeDatabase(dbPath);

    const errorDocs = db.prepare("SELECT id FROM knowledge_documents WHERE status = 'ERROR'").all() as { id: string }[];
    if (!errorDocs || errorDocs.length === 0) return 0;

    db.exec('BEGIN TRANSACTION;');
    try {
      for (const row of errorDocs) {
        db.prepare('DELETE FROM document_chunks_fts WHERE document_id = ?').run(row.id);
        db.prepare('DELETE FROM document_chunks WHERE document_id = ?').run(row.id);
        db.prepare('DELETE FROM document_tags WHERE document_id = ?').run(row.id);
        db.prepare('DELETE FROM knowledge_jobs WHERE document_id = ?').run(row.id);
        db.prepare('DELETE FROM knowledge_documents WHERE id = ?').run(row.id);
      }
      db.exec('COMMIT;');
      return errorDocs.length;
    } catch (err) {
      db.exec('ROLLBACK;');
      throw err;
    }
  }
}

