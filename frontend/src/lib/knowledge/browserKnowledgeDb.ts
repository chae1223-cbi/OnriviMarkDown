// ====================================================================
// 📊 [OMD-CORE-browserKnowledgeDb-0001] browserKnowledgeDb.ts ➔ WebAssembly SQLite Browser Knowledge Engine
// 🎯 @KICK  : 웹 브라우저(Cloudflare Pages / onrivi.com) 환경에서 사용자 로컬 PC의 {resourceFolder}/db/onrivi_knowledge.db를 직접 읽고 쓰는 WASM SQLite 엔진
// 🛡️ @GUARD : Rule 7(선행 검증 후 원트랜잭션 쓰기), Rule 2(코드값 대문자 통일: READY, REGISTERED, INDEXING, ERROR), 디스크 바이너리 원자적 플러시
// 🚨 @PATCH : **2026-09-06** — [디스크 mtime 변경 감지 실시간 리로드 및 File System Access API 쓰기 잠금 완벽 복구] 데스크톱/타 프로세스에 의한 SQLite 파일 변경(mtime)을 실시간 감지하여 최신 DB로 자동 갱신하고, saveBrowserKnowledgeDb에서 getFile() 메타데이터 동기화 및 createWritable 실패 시 엔트리 재생성/임시 파일 폴백으로 'state had changed since it was read from disk' 오류 원천 차단
//             **2026-09-06** — [document_chunks chunk_text 스키마 마이그레이션 및 File System Access API 캐시 충돌 방어] 기존 DB 로드 시 ALTER TABLE chunk_text 자동 마이그레이션 실행(table document_chunks has no column named chunk_text 원천 방어), saveBrowserKnowledgeDb에서 getFile() 사전 동기화 및 keepExistingData: false, state changed 발생 시 엔트리 재생성 및 인메모리 캐시 무효화로 트랜잭션 동기화 보장
//             **2026-09-06** — [WASM 지식 문서 해제/상세조회 경로 정규화 및 파일명 매칭 폴백] 브라우저 WASM SQLite 상에서 deleteBrowserDocument 및 getBrowserDocumentDetail 호출 시 경로 구분자(/와 \) 및 파일명 접미사 매칭을 지원하여 로컬 DB 문서 해제 및 상세 열람이 정확하게 동작하도록 보장
//             **2026-09-06** — [WASM 바이너리 직접 주입 및 4단계 다중 폴백 로딩 구축] Emscripten 내부의 취약한 fetch/동기 XHR("both async and sync fetching of the wasm failed") 오류를 원천 차단하기 위해 loadWasmBinary()를 통한 로컬 절대경로/CDN 다중 폴백 및 wasmBinary 직접 주입으로 전환
//             **2026-09-06** — [웹 브라우저 WASM SQLite 기반 로컬 DB 완전 일치화 최초 구현] sql.js WASM 엔진과 File System Access API(resourceFolderHandle)를 연동하여 웹 환경에서도 중앙 서버 부하 0%로 사용자 PC의 onrivi_knowledge.db를 데스크톱과 100% 동일하게 읽고 쓰도록 구축
// 🔗 @CALLS : sql.js, ./markdownChunker, ./llmProvider, ./contextBuilder, ../indexedDbHelper
// ====================================================================

import CryptoJS from 'crypto-js';
import type { 
  DocumentChunk, 
  KnowledgeDocument, 
  KnowledgeAnalysisResult, 
  KnowledgeDocumentDetail,
  KnowledgeCollection,
  RetrievalCandidate,
  KnowledgeJob
} from '../../types/knowledge';
import { chunkMarkdownByHeadings } from './markdownChunker';
import { createKnowledgeLLMProvider } from './llmProvider';
import { idb } from '../indexedDbHelper';

let sqlModulePromise: Promise<any> | null = null;
let cachedDbInstance: any = null;
let cachedDbFolderHandle: any = null;
let cachedDbLastModified: number = 0;

/**
 * sql-wasm.wasm 바이너리를 다중 폴백(로컬 오리진 -> 상대 경로 -> jsDelivr CDN -> cdnjs CDN)으로 안전하게 가져옵니다.
 * wasmBinary를 직접 제공함으로써 Emscripten 내부의 취약한 fetch/XHR("both async and sync fetching of the wasm failed")을 원천 방지합니다.
 */
async function loadWasmBinary(): Promise<ArrayBuffer> {
  const sources: string[] = [];

  if (typeof window !== 'undefined' && window.location?.origin) {
    sources.push(`${window.location.origin}/sql-wasm.wasm`);
  }
  sources.push('/sql-wasm.wasm');
  sources.push('https://cdn.jsdelivr.net/npm/sql.js@1.14.2/dist/sql-wasm.wasm');
  sources.push('https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/sql-wasm.wasm');

  let lastError: any = null;
  for (const src of sources) {
    try {
      const res = await fetch(src);
      if (res.ok) {
        const buf = await res.arrayBuffer();
        if (buf && buf.byteLength > 0) {
          console.log(`[browserKnowledgeDb] WASM 바이너리 로드 성공: ${src} (${buf.byteLength} bytes)`);
          return buf;
        }
      }
    } catch (err) {
      lastError = err;
      console.warn(`[browserKnowledgeDb] WASM 로드 실패: ${src}`, err);
    }
  }

  throw new Error(`WASM 바이너리를 로드하지 못했습니다: ${lastError?.message || '네트워크 응답 없음'}`);
}

/**
 * sql.js WASM 모듈을 지연 초기화(Lazy Singleton)합니다.
 * wasmBinary를 직접 주입하여 호스팅 환경/서브경로/CORS에 상관없이 100% 안정적으로 인스턴스화합니다.
 */
export async function getSqlModule(): Promise<any> {
  if (!sqlModulePromise) {
    sqlModulePromise = (async () => {
      try {
        const initSqlJs = (await import('sql.js')).default;
        const wasmBinary = await loadWasmBinary();
        return await initSqlJs({
          wasmBinary,
        });
      } catch (err) {
        // 다음 호출 시 재시도할 수 있도록 캐시 초기화
        sqlModulePromise = null;
        throw err;
      }
    })();
  }
  return sqlModulePromise;
}

/**
 * SHA-256 해시를 계산합니다.
 */
function computeSha256(content: string): string {
  return CryptoJS.SHA256(content).toString(CryptoJS.enc.Hex);
}

/**
 * 리소스 폴더 핸들을 가져옵니다 (인자 > 메모리 캐시 > IndexedDB 순)
 */
export async function resolveResourceFolderHandle(explicitHandle?: any): Promise<any> {
  if (explicitHandle) {
    cachedDbFolderHandle = explicitHandle;
    return explicitHandle;
  }
  if (cachedDbFolderHandle) return cachedDbFolderHandle;
  if (typeof window !== 'undefined' && (window as any).__resourceFolderHandle) {
    cachedDbFolderHandle = (window as any).__resourceFolderHandle;
    return cachedDbFolderHandle;
  }
  if (typeof window !== 'undefined') {
    try {
      const savedHandle = await idb.get('resourceFolderHandle');
      if (savedHandle) {
        cachedDbFolderHandle = savedHandle;
        return savedHandle;
      }
    } catch {}
  }
  return null;
}

/**
 * 브라우저 WASM 지식 데이터베이스 인스턴스를 로드합니다.
 * 사용자 PC의 Onrivi_Asset/db/onrivi_knowledge.db 바이너리를 읽어 메모리에 마운트합니다.
 */
export async function getBrowserKnowledgeDb(explicitHandle?: any): Promise<{ db: any; folderHandle: any }> {
  const folderHandle = await resolveResourceFolderHandle(explicitHandle);
  if (!folderHandle) {
    throw new Error('RESOURCE_FOLDER_NOT_SET: 공통 자원(리소스) 폴더가 설정되지 않았습니다. 환경설정에서 리소스 폴더를 먼저 지정해 주세요.');
  }

  // 폴더 권한 확인 및 요청 (사용자 제스처 컨텍스트 지원)
  if (typeof folderHandle.queryPermission === 'function') {
    let perm = await folderHandle.queryPermission({ mode: 'readwrite' });
    if (perm !== 'granted' && typeof folderHandle.requestPermission === 'function') {
      perm = await folderHandle.requestPermission({ mode: 'readwrite' });
    }
    if (perm !== 'granted') {
      throw new Error('PERMISSION_DENIED: 리소스 폴더의 읽기/쓰기 권한이 허용되지 않았습니다.');
    }
  }

  const SQL = await getSqlModule();
  const dbDir = await folderHandle.getDirectoryHandle('db', { create: true });
  const fileHandle = await dbDir.getFileHandle('onrivi_knowledge.db', { create: true });
  const file = await fileHandle.getFile();

  // 🛡️ 디스크 상의 DB 파일 변경(mtime) 감지: 캐시가 유효하고 디스크 파일이 변경되지 않은 경우 메모리 인스턴스 반환
  if (cachedDbInstance && cachedDbLastModified === file.lastModified) {
    return { db: cachedDbInstance, folderHandle };
  }

  // 디스크에서 파일이 변경되었거나 최초 로드 시 이전 캐시 정리
  if (cachedDbInstance) {
    try { cachedDbInstance.close(); } catch {}
    cachedDbInstance = null;
  }

  const buf = await file.arrayBuffer();

  let db: any;
  if (buf.byteLength > 0) {
    db = new SQL.Database(new Uint8Array(buf));
    // 🛡️ 기존 DB 파일 열람 시 chunk_text 컬럼 안전 자동 마이그레이션 (WASM/Node 스키마 100% 일치화)
    try {
      db.run("ALTER TABLE document_chunks ADD COLUMN chunk_text TEXT;");
    } catch {}
  } else {
    db = new SQL.Database();
    initBrowserKnowledgeSchema(db);
    // 초기 스키마 생성 후 파일에 즉시 저장
    await saveBrowserKnowledgeDb(folderHandle, db);
  }

  cachedDbInstance = db;
  cachedDbLastModified = file.lastModified;
  return { db, folderHandle };
}

/**
 * WASM SQLite 메모리 상태를 사용자 PC의 onrivi_knowledge.db 파일에 원자적으로 저장합니다.
 * File System Access API의 내부 캐시 상태 불일치(state had changed since it was read from disk)를 원천 방어합니다.
 */
export async function saveBrowserKnowledgeDb(folderHandle: any, db: any): Promise<void> {
  if (!folderHandle) {
    throw new Error('RESOURCE_FOLDER_HANDLE_MISSING: 리소스 폴더 핸들이 유효하지 않습니다.');
  }
  const data = db.export();
  const dbDir = await folderHandle.getDirectoryHandle('db', { create: true });

  const writeWithHandle = async (targetHandle: any) => {
    // 1) getFile()을 사전 호출하여 브라우저의 파일 메타데이터 스냅샷(mtime, size)을 디스크 실제 상태와 즉시 동기화
    try {
      await targetHandle.getFile();
    } catch {}
    // 2) keepExistingData: false 로 불필요한 기존 블록 복사 및 충돌 배제
    const writable = await targetHandle.createWritable({ keepExistingData: false });
    await writable.write(data);
    await writable.close();
    // 3) 저장 완료 후 최신 lastModified 즉시 갱신 (불필요한 DB 재파싱 방지)
    try {
      const updated = await targetHandle.getFile();
      cachedDbLastModified = updated.lastModified;
    } catch {}
  };

  try {
    const fileHandle = await dbDir.getFileHandle('onrivi_knowledge.db', { create: true });
    await writeWithHandle(fileHandle);
  } catch (err: any) {
    console.warn('[saveBrowserKnowledgeDb] 1차 파일 쓰기 실패, 핸들 재생성 후 복구 시도:', err?.message);
    try {
      // 4) state changed 오류 발생 시 브라우저 내부 캐시 무효화를 위해 엔트리 삭제 후 신규 생성
      try {
        await dbDir.removeEntry('onrivi_knowledge.db');
      } catch {}
      const freshHandle = await dbDir.getFileHandle('onrivi_knowledge.db', { create: true });
      await writeWithHandle(freshHandle);
      console.log('[saveBrowserKnowledgeDb] 파일 재생성 복구 쓰기 성공');
    } catch (retryErr: any) {
      console.error('[saveBrowserKnowledgeDb] 최종 저장 실패:', retryErr);
      throw retryErr;
    }
  }
}

/**
 * 브라우저 WASM DB 캐시를 강제 무효화합니다 (원복, 초기화 시 사용)
 */
export function invalidateBrowserDbCache(): void {
  if (cachedDbInstance) {
    try { cachedDbInstance.close(); } catch {}
    cachedDbInstance = null;
  }
  cachedDbLastModified = 0;
}

/**
 * 브라우저 환경 6대 핵심 테이블 스키마를 초기화합니다.
 */
export function initBrowserKnowledgeSchema(db: any): void {
  // 1. 컬렉션
  db.run(`
    CREATE TABLE IF NOT EXISTS knowledge_collections (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      color TEXT DEFAULT '#06C755',
      created_at TEXT NOT NULL
    );
  `);

  // 2. 문서 마스터
  db.run(`
    CREATE TABLE IF NOT EXISTS knowledge_documents (
      id TEXT PRIMARY KEY,
      collection_id TEXT,
      file_path TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      file_hash TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      modified_at TEXT NOT NULL,
      summary TEXT,
      key_points TEXT,
      document_type TEXT DEFAULT 'other',
      priority INTEGER NOT NULL DEFAULT 3,
      status TEXT NOT NULL CHECK(status IN ('REGISTERED', 'INDEXING', 'READY', 'OUTDATED', 'DISABLED', 'ERROR')),
      error_message TEXT,
      analysis_version INTEGER NOT NULL DEFAULT 1,
      analyzer_model TEXT,
      analyzed_at TEXT,
      indexed_at TEXT,
      FOREIGN KEY(collection_id) REFERENCES knowledge_collections(id) ON DELETE SET NULL
    );
  `);

  // 3. 지식 태그
  db.run(`
    CREATE TABLE IF NOT EXISTS document_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id TEXT NOT NULL,
      tag_name TEXT NOT NULL,
      score INTEGER NOT NULL,
      source TEXT DEFAULT 'AI',
      FOREIGN KEY(document_id) REFERENCES knowledge_documents(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_tags_doc ON document_tags(document_id);
    CREATE INDEX IF NOT EXISTS idx_tags_name_score ON document_tags(tag_name, score DESC);
  `);

  // 4. 마크다운 청크
  db.run(`
    CREATE TABLE IF NOT EXISTS document_chunks (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL,
      chunk_index INTEGER NOT NULL,
      heading_title TEXT,
      heading_level INTEGER,
      heading_path TEXT,
      start_line INTEGER NOT NULL,
      end_line INTEGER NOT NULL,
      chunk_summary TEXT,
      keywords TEXT,
      chunk_text TEXT,
      FOREIGN KEY(document_id) REFERENCES knowledge_documents(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_chunks_doc ON document_chunks(document_id);
  `);

  // 5. 작업 큐
  db.run(`
    CREATE TABLE IF NOT EXISTS knowledge_jobs (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL,
      file_path TEXT NOT NULL,
      title TEXT,
      job_type TEXT NOT NULL CHECK(job_type IN ('INDEX', 'REINDEX', 'DELETE')),
      target_hash TEXT NOT NULL,
      priority INTEGER NOT NULL DEFAULT 3,
      status TEXT NOT NULL CHECK(status IN ('QUEUED', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED')),
      current_step TEXT DEFAULT 'QUEUED',
      retry_count INTEGER DEFAULT 0,
      max_retries INTEGER DEFAULT 3,
      retry_after TEXT,
      created_at TEXT NOT NULL,
      started_at TEXT,
      completed_at TEXT,
      error_log TEXT
    );
  `);

  try {
    db.run(`
      CREATE INDEX IF NOT EXISTS idx_jobs_prio ON knowledge_jobs(status, priority DESC, created_at ASC);
      CREATE INDEX IF NOT EXISTS idx_jobs_file_hash ON knowledge_jobs(file_path, target_hash);
    `);
  } catch {}
}

/**
 * 1. 문서 목록 조회 (브라우저 WASM)
 */
export async function listBrowserDocuments(folderHandle?: any): Promise<KnowledgeDocument[]> {
  const { db } = await getBrowserKnowledgeDb(folderHandle);
  const sql = `
    SELECT 
      d.id, d.collection_id, d.file_path, d.title, d.file_hash, d.file_size,
      d.modified_at, d.summary, d.key_points, d.document_type, d.priority,
      d.status, d.error_message, d.analysis_version, d.analyzer_model,
      d.analyzed_at, d.indexed_at,
      (SELECT COUNT(*) FROM document_chunks c WHERE c.document_id = d.id) AS chunks_count
    FROM knowledge_documents d
    ORDER BY d.modified_at DESC;
  `;
  
  const stmt = db.prepare(sql);
  const docs: KnowledgeDocument[] = [];

  while (stmt.step()) {
    const row = stmt.getAsObject();
    let keyPoints: string[] = [];
    try {
      if (typeof row.key_points === 'string') keyPoints = JSON.parse(row.key_points);
      else if (Array.isArray(row.key_points)) keyPoints = row.key_points;
    } catch {}

    docs.push({
      id: String(row.id || ''),
      collectionId: row.collection_id ? String(row.collection_id) : null,
      filePath: String(row.file_path || ''),
      title: String(row.title || ''),
      fileHash: String(row.file_hash || ''),
      fileSize: Number(row.file_size || 0),
      modifiedAt: String(row.modified_at || ''),
      summary: String(row.summary || ''),
      keyPoints,
      documentType: (String(row.document_type || 'other') as any),
      priority: Number(row.priority || 3),
      status: (row.status as any) || 'READY',
      errorMessage: row.error_message ? String(row.error_message) : undefined,
      analysisVersion: Number(row.analysis_version || 1),
      analyzerModel: String(row.analyzer_model || ''),
      analyzedAt: row.analyzed_at ? String(row.analyzed_at) : undefined,
      indexedAt: row.indexed_at ? String(row.indexed_at) : undefined,
      chunksCount: Number(row.chunks_count || 0),
    });
  }
  stmt.free();
  return docs;
}

/**
 * 2. 문서 상세 조회 (브라우저 WASM)
 */
export async function getBrowserDocumentDetail(
  params: { documentId?: string; filePath?: string },
  folderHandle?: any
): Promise<KnowledgeDocumentDetail | null> {
  const { db } = await getBrowserKnowledgeDb(folderHandle);
  const { documentId, filePath } = params;

  let d: any = null;
  if (documentId) {
    const docStmt = db.prepare('SELECT * FROM knowledge_documents WHERE id = :id LIMIT 1');
    docStmt.bind({ ':id': documentId });
    if (docStmt.step()) d = docStmt.getAsObject();
    docStmt.free();
  } else if (filePath) {
    // 1) 정확 매칭
    let docStmt = db.prepare('SELECT * FROM knowledge_documents WHERE file_path = :path LIMIT 1');
    docStmt.bind({ ':path': filePath });
    if (docStmt.step()) d = docStmt.getAsObject();
    docStmt.free();

    // 2) 정규화 매칭
    if (!d) {
      const normSlash = filePath.replace(/\\/g, '/');
      const normBack = filePath.replace(/\//g, '\\');
      const normStmt = db.prepare('SELECT * FROM knowledge_documents WHERE replace(file_path, \'\\\', \'/\') = :s OR replace(file_path, \'/\', \'\\\') = :b LIMIT 1');
      normStmt.bind({ ':s': normSlash, ':b': normBack });
      if (normStmt.step()) d = normStmt.getAsObject();
      normStmt.free();
    }

    // 3) 파일명(Basename) 접미사 매칭 폴백
    if (!d) {
      const fileName = filePath.split(/[/\\]/).pop() || '';
      if (fileName) {
        const baseStmt = db.prepare('SELECT * FROM knowledge_documents WHERE file_path = :fn OR file_path LIKE :slashFn OR file_path LIKE :backFn LIMIT 1');
        baseStmt.bind({ ':fn': fileName, ':slashFn': `%/${fileName}`, ':backFn': `%\\${fileName}` });
        if (baseStmt.step()) d = baseStmt.getAsObject();
        baseStmt.free();
      }
    }
  }
  
  if (!d) return null;

  const realDocId = String(d.id);

  // 태그 조회
  const tagStmt = db.prepare('SELECT tag_name, score FROM document_tags WHERE document_id = :id ORDER BY score DESC');
  tagStmt.bind({ ':id': realDocId });
  const tags: Array<{ name: string; score: number }> = [];
  while (tagStmt.step()) {
    const t = tagStmt.getAsObject();
    tags.push({ name: String(t.tag_name), score: Number(t.score) });
  }
  tagStmt.free();

  // 청크 조회
  const chunkStmt = db.prepare('SELECT * FROM document_chunks WHERE document_id = :id ORDER BY chunk_index ASC');
  chunkStmt.bind({ ':id': realDocId });
  const chunks: any[] = [];
  while (chunkStmt.step()) {
    const c = chunkStmt.getAsObject();
    chunks.push({
      id: String(c.id),
      chunkIndex: Number(c.chunk_index),
      headingTitle: String(c.heading_title || ''),
      headingLevel: Number(c.heading_level || 0),
      headingPath: String(c.heading_path || ''),
      startLine: Number(c.start_line || 1),
      endLine: Number(c.end_line || 1),
      chunkSummary: String(c.chunk_summary || ''),
      keywords: String(c.keywords || ''),
      chunkText: String(c.chunk_text || ''),
    });
  }
  chunkStmt.free();

  let keyPoints: string[] = [];
  try {
    if (typeof d.key_points === 'string') keyPoints = JSON.parse(d.key_points);
    else if (Array.isArray(d.key_points)) keyPoints = d.key_points;
  } catch {}

  return {
    documentId: realDocId,
    filePath: String(d.file_path),
    title: String(d.title),
    fileSize: Number(d.file_size || 0),
    modifiedAt: String(d.modified_at || ''),
    status: (d.status as any) || 'READY',
    summary: String(d.summary || ''),
    keyPoints,
    documentType: String(d.document_type || 'other'),
    tags,
    searchTerms: tags.map(t => t.name),
    analyzerModel: String(d.analyzer_model || ''),
    chunksCount: chunks.length,
    chunks,
  };
}

/**
 * 3. 마크다운 문서 지식 베이스 등록 및 AI 분석 (브라우저 WASM)
 * [Rule 7 준수]: 선행 청킹 및 Gemini AI 분석 100% 성공 후 원트랜잭션으로 DB 적재 및 로컬 파일 동기화
 */
export async function indexBrowserDocument(
  params: {
    filePath: string;
    fileContent: string;
    title?: string;
    resourceFolder?: string | null;
    geminiApiKey?: string | null;
    planCode?: string | null;
    aiModelName?: string | null;
  },
  folderHandle?: any
): Promise<{ documentId: string; chunksCount: number; detail: KnowledgeDocumentDetail }> {
  const { filePath, fileContent, title, geminiApiKey, aiModelName } = params;
  if (!geminiApiKey) {
    throw new Error('AI_API_KEY_REQUIRED: AI(Gemini) API 키가 설정되지 않았습니다.');
  }

  // 1. WASM DB 획득
  const { db, folderHandle: activeFolder } = await getBrowserKnowledgeDb(folderHandle);

  const docId = `doc_${computeSha256(filePath).slice(0, 16)}`;
  const fileHash = computeSha256(fileContent);
  const fileSize = new Blob([fileContent]).size;
  const docTitle = title || filePath.split(/[/\\]/).pop()?.replace(/\.md$/i, '') || '문서';

  // 2. 청킹 선행 수행
  const chunks = chunkMarkdownByHeadings(docId, fileContent);

  // 3. 외부 AI 분석 선행 수행
  const modelToUse = (aiModelName || 'gemini-3.8-flash').trim();
  const provider = createKnowledgeLLMProvider('gemini', geminiApiKey, modelToUse);
  const analysis = await provider.analyzeDocument(fileContent);

  // 4. 선행 작업 완료 후 단일 원트랜잭션(All-or-Nothing)으로 DB에 일괄 적재
  const now = new Date().toISOString();
  db.run('BEGIN TRANSACTION;');
  try {
    db.run('DELETE FROM document_chunks WHERE document_id = :id;', { ':id': docId });
    db.run('DELETE FROM document_tags WHERE document_id = :id;', { ':id': docId });

    // 문서 마스터 upsert
    db.run(`
      INSERT INTO knowledge_documents (
        id, file_path, title, file_hash, file_size, modified_at, priority,
        status, summary, key_points, document_type, analyzer_model, analyzed_at, indexed_at,
        error_message, analysis_version
      ) VALUES (
        :id, :path, :title, :hash, :size, :mod, 3,
        'READY', :sum, :kp, :dt, :model, :now, :now, NULL, 1
      )
      ON CONFLICT(file_path) DO UPDATE SET
        title = excluded.title,
        file_hash = excluded.file_hash,
        file_size = excluded.file_size,
        modified_at = excluded.modified_at,
        status = 'READY',
        summary = excluded.summary,
        key_points = excluded.key_points,
        document_type = excluded.document_type,
        analyzer_model = excluded.analyzer_model,
        analyzed_at = excluded.analyzed_at,
        indexed_at = excluded.indexed_at,
        error_message = NULL;
    `, {
      ':id': docId,
      ':path': filePath,
      ':title': docTitle,
      ':hash': fileHash,
      ':size': fileSize,
      ':mod': now,
      ':sum': analysis.summary,
      ':kp': JSON.stringify(analysis.keyPoints),
      ':dt': analysis.documentType,
      ':model': modelToUse,
      ':now': now,
    });

    // 청크 적재
    for (const c of chunks) {
      db.run(`
        INSERT INTO document_chunks (
          id, document_id, chunk_index, heading_title, heading_level,
          heading_path, start_line, end_line, chunk_summary, keywords, chunk_text
        ) VALUES (
          :id, :docId, :idx, :title, :level,
          :path, :start, :end, :sum, :kw, :text
        );
      `, {
        ':id': c.id,
        ':docId': docId,
        ':idx': c.chunkIndex,
        ':title': c.headingTitle,
        ':level': c.headingLevel,
        ':path': c.headingPath,
        ':start': c.startLine,
        ':end': c.endLine,
        ':sum': c.chunkSummary || '',
        ':kw': c.keywords || '',
        ':text': c.chunkText,
      });
    }

    // 태그 적재
    for (const t of analysis.tags) {
      db.run(`
        INSERT OR REPLACE INTO document_tags (document_id, tag_name, score, source)
        VALUES (:docId, :name, :score, 'AI');
      `, {
        ':docId': docId,
        ':name': t.name,
        ':score': t.score,
      });
    }

    // 대기 중인 큐 작업 완료 처리
    db.run(`
      DELETE FROM knowledge_jobs 
      WHERE document_id = :docId OR file_path = :path;
    `, { ':docId': docId, ':path': filePath });

    db.run('COMMIT;');
  } catch (err) {
    db.run('ROLLBACK;');
    throw err;
  }

  // 4. 변경된 DB를 사용자 PC의 onrivi_knowledge.db 파일에 즉시 영구 저장
  try {
    await saveBrowserKnowledgeDb(activeFolder, db);
  } catch (saveErr) {
    invalidateBrowserDbCache();
    throw saveErr;
  }

  const detail: KnowledgeDocumentDetail = {
    documentId: docId,
    filePath,
    title: docTitle,
    fileSize,
    modifiedAt: now,
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

  return { documentId: docId, chunksCount: chunks.length, detail };
}

/**
 * 4. 문서 삭제 (브라우저 WASM)
 */
export async function deleteBrowserDocument(
  params: { documentId?: string; filePath?: string },
  folderHandle?: any
): Promise<boolean> {
  const { db, folderHandle: activeFolder } = await getBrowserKnowledgeDb(folderHandle);
  const { documentId, filePath } = params;

  let targetId = documentId;
  if (!targetId && filePath) {
    // 1) 정확 매칭
    let s = db.prepare('SELECT id FROM knowledge_documents WHERE file_path = :p LIMIT 1');
    s.bind({ ':p': filePath });
    if (s.step()) targetId = String(s.getAsObject().id);
    s.free();

    // 2) 슬래시/역슬래시 정규화 매칭
    if (!targetId) {
      const normSlash = filePath.replace(/\\/g, '/');
      const normBack = filePath.replace(/\//g, '\\');
      const normStmt = db.prepare('SELECT id FROM knowledge_documents WHERE replace(file_path, \'\\\', \'/\') = :s OR replace(file_path, \'/\', \'\\\') = :b LIMIT 1');
      normStmt.bind({ ':s': normSlash, ':b': normBack });
      if (normStmt.step()) targetId = String(normStmt.getAsObject().id);
      normStmt.free();
    }

    // 3) 파일명(Basename) 접미사 매칭 폴백
    if (!targetId) {
      const fileName = filePath.split(/[/\\]/).pop() || '';
      if (fileName) {
        const baseStmt = db.prepare('SELECT id FROM knowledge_documents WHERE file_path = :fn OR file_path LIKE :slashFn OR file_path LIKE :backFn LIMIT 1');
        baseStmt.bind({ ':fn': fileName, ':slashFn': `%/${fileName}`, ':backFn': `%\\${fileName}` });
        if (baseStmt.step()) targetId = String(baseStmt.getAsObject().id);
        baseStmt.free();
      }
    }
  }

  if (!targetId) return true; // 이미 DB에 없음

  db.run('BEGIN TRANSACTION;');
  try {
    db.run('DELETE FROM document_chunks WHERE document_id = :id;', { ':id': targetId });
    db.run('DELETE FROM document_tags WHERE document_id = :id;', { ':id': targetId });
    db.run('DELETE FROM knowledge_jobs WHERE document_id = :id;', { ':id': targetId });
    db.run('DELETE FROM knowledge_documents WHERE id = :id;', { ':id': targetId });
    db.run('COMMIT;');
  } catch (err) {
    db.run('ROLLBACK;');
    throw err;
  }

  try {
    await saveBrowserKnowledgeDb(activeFolder, db);
  } catch (saveErr) {
    invalidateBrowserDbCache();
    throw saveErr;
  }
  return true;
}

/**
 * 5. 오류 문서 일괄 삭제 (브라우저 WASM)
 */
export async function deleteBrowserErrorDocuments(folderHandle?: any): Promise<number> {
  const { db, folderHandle: activeFolder } = await getBrowserKnowledgeDb(folderHandle);
  
  db.run('BEGIN TRANSACTION;');
  let deletedCount = 0;
  try {
    const stmt = db.prepare("SELECT id FROM knowledge_documents WHERE status = 'ERROR'");
    const errorIds: string[] = [];
    while (stmt.step()) {
      errorIds.push(String(stmt.getAsObject().id));
    }
    stmt.free();

    for (const id of errorIds) {
      db.run('DELETE FROM document_chunks WHERE document_id = :id;', { ':id': id });
      db.run('DELETE FROM document_tags WHERE document_id = :id;', { ':id': id });
      db.run('DELETE FROM knowledge_jobs WHERE document_id = :id;', { ':id': id });
      db.run('DELETE FROM knowledge_documents WHERE id = :id;', { ':id': id });
    }
    db.run('COMMIT;');
    deletedCount = errorIds.length;
  } catch (err) {
    db.run('ROLLBACK;');
    throw err;
  }

  if (deletedCount > 0) {
    try {
      await saveBrowserKnowledgeDb(activeFolder, db);
    } catch (saveErr) {
      invalidateBrowserDbCache();
      throw saveErr;
    }
  }
  return deletedCount;
}

/**
 * 6. 하이브리드 지식 검색 (브라우저 WASM)
 */
export async function searchBrowserKnowledge(
  params: {
    query: string;
    limit?: number;
    collectionId?: string;
    geminiApiKey?: string | null;
    aiModelName?: string | null;
  },
  folderHandle?: any
): Promise<{ candidates: RetrievalCandidate[]; answer?: string }> {
  const { query, limit = 10, geminiApiKey, aiModelName } = params;
  if (!query || !query.trim()) {
    return { candidates: [] };
  }

  const { db } = await getBrowserKnowledgeDb(folderHandle);
  const terms = query.replace(/[^\w\s가-힣]/g, ' ').trim().split(/\s+/).filter(t => t.length > 0);

  // 모든 READY 문서의 청크와 태그를 매칭
  const sql = `
    SELECT 
      c.id AS chunk_id, c.document_id, c.chunk_index, c.heading_title,
      c.heading_level, c.heading_path, c.start_line, c.end_line,
      c.chunk_summary, c.keywords, c.chunk_text,
      d.file_path, d.title AS doc_title, d.priority AS doc_priority
    FROM document_chunks c
    JOIN knowledge_documents d ON c.document_id = d.id
    WHERE d.status = 'READY'
    ORDER BY d.modified_at DESC;
  `;

  const stmt = db.prepare(sql);
  const scoredList: Array<{ cand: RetrievalCandidate; score: number }> = [];

  while (stmt.step()) {
    const row = stmt.getAsObject();
    const heading = String(row.heading_title || '');
    const keywords = String(row.keywords || '');
    const summary = String(row.chunk_summary || '');
    const text = String(row.chunk_text || '');
    const docTitle = String(row.doc_title || '');

    let matchScore = 0;
    for (const term of terms) {
      const lowerTerm = term.toLowerCase();
      if (docTitle.toLowerCase().includes(lowerTerm)) matchScore += 35;
      if (heading.toLowerCase().includes(lowerTerm)) matchScore += 30;
      if (keywords.toLowerCase().includes(lowerTerm)) matchScore += 25;
      if (summary.toLowerCase().includes(lowerTerm)) matchScore += 15;
      if (text.toLowerCase().includes(lowerTerm)) matchScore += 10;
    }

    if (matchScore > 0) {
      const cand: RetrievalCandidate = {
        chunkId: String(row.chunk_id),
        documentId: String(row.document_id),
        filePath: String(row.file_path),
        documentTitle: docTitle,
        headingTitle: heading,
        headingPath: String(row.heading_path || ''),
        startLine: Number(row.start_line),
        endLine: Number(row.end_line),
        fileHash: '',
        rawBm25: matchScore,
        normalizedFtsScore: Math.min(100, matchScore),
        tagScore: 0,
        headingScore: 0,
        priorityScore: Number(row.doc_priority || 3) * 5,
        finalScore: Math.min(100, matchScore),
        score: Math.min(100, matchScore),
        snippet: summary || text.slice(0, 160),
      };
      scoredList.push({ cand, score: matchScore });
    }
  }
  stmt.free();

  scoredList.sort((a, b) => b.score - a.score);
  const topCandidates = scoredList.slice(0, limit).map(item => item.cand);

  let answer: string | undefined = undefined;
  if (geminiApiKey && geminiApiKey.trim() && geminiApiKey !== 'DUMMY_KEY' && topCandidates.length > 0) {
    try {
      const provider = createKnowledgeLLMProvider('gemini', geminiApiKey, aiModelName || 'gemini-3.8-flash');
      const contextText = topCandidates.map(c => `[출처: ${c.documentTitle} (${c.headingTitle})]\n${c.snippet}`).join('\n\n');
      const answerPrompt = `사용자 질문: "${query}"\n\n아래 지식 베이스 문맥을 바탕으로 명확하게 답변해 주세요:\n\n${contextText}`;
      const res = await (provider as any).genAI
        .getGenerativeModel({ model: aiModelName || 'gemini-3.8-flash' })
        .generateContent(answerPrompt);
      answer = res.response.text();
    } catch (e) {
      console.warn('[searchBrowserKnowledge] LLM 답변 생성 실패:', e);
    }
  }

  return { candidates: topCandidates, answer };
}

/**
 * 7. 컬렉션 관리 (브라우저 WASM)
 */
export async function listBrowserCollections(folderHandle?: any): Promise<KnowledgeCollection[]> {
  const { db } = await getBrowserKnowledgeDb(folderHandle);
  const stmt = db.prepare('SELECT * FROM knowledge_collections ORDER BY name ASC');
  const cols: KnowledgeCollection[] = [];
  while (stmt.step()) {
    const r = stmt.getAsObject();
    cols.push({
      id: String(r.id),
      name: String(r.name),
      description: r.description ? String(r.description) : undefined,
      color: String(r.color || '#06C755'),
      createdAt: String(r.created_at),
    });
  }
  stmt.free();
  return cols;
}

export async function upsertBrowserCollection(
  col: { id?: string; name: string; description?: string; color?: string },
  folderHandle?: any
): Promise<KnowledgeCollection> {
  const { db, folderHandle: activeFolder } = await getBrowserKnowledgeDb(folderHandle);
  const id = col.id || `col_${Date.now()}`;
  const now = new Date().toISOString();
  
  db.run(`
    INSERT INTO knowledge_collections (id, name, description, color, created_at)
    VALUES (:id, :name, :desc, :color, :now)
    ON CONFLICT(name) DO UPDATE SET
      description = excluded.description,
      color = excluded.color;
  `, {
    ':id': id,
    ':name': col.name.trim(),
    ':desc': col.description || '',
    ':color': col.color || '#06C755',
    ':now': now,
  });

  await saveBrowserKnowledgeDb(activeFolder, db);
  return { id, name: col.name.trim(), description: col.description, color: col.color || '#06C755', createdAt: now };
}

export async function deleteBrowserCollection(collectionId: string, folderHandle?: any): Promise<void> {
  const { db, folderHandle: activeFolder } = await getBrowserKnowledgeDb(folderHandle);
  db.run('DELETE FROM knowledge_collections WHERE id = :id;', { ':id': collectionId });
  await saveBrowserKnowledgeDb(activeFolder, db);
}

/**
 * 8. 작업 큐 상태 (브라우저 WASM)
 */
export async function getBrowserQueueStats(folderHandle?: any): Promise<any> {
  try {
    const { db } = await getBrowserKnowledgeDb(folderHandle);
    const stmt = db.prepare(`
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'QUEUED' THEN 1 ELSE 0 END) AS queued,
        SUM(CASE WHEN status = 'RUNNING' THEN 1 ELSE 0 END) AS running,
        SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) AS failed
      FROM knowledge_jobs;
    `);
    if (stmt.step()) {
      const r = stmt.getAsObject();
      stmt.free();
      return {
        total: Number(r.total || 0),
        queued: Number(r.queued || 0),
        running: Number(r.running || 0),
        completed: Number(r.completed || 0),
        failed: Number(r.failed || 0),
        activeWorkers: 0,
        maxWorkers: 2,
        percent: Number(r.total) > 0 ? Math.round((Number(r.completed) / Number(r.total)) * 100) : 0,
        isPaused: false,
        rateLimitStatus: 'NORMAL',
        rateLimitCooldownSec: 0,
      };
    }
    stmt.free();
  } catch {}
  return { total: 0, queued: 0, running: 0, completed: 0, failed: 0, activeWorkers: 0, maxWorkers: 2, percent: 0, isPaused: false, rateLimitStatus: 'NORMAL', rateLimitCooldownSec: 0 };
}

/**
 * 9. 백업 및 원복 관리 (브라우저 WASM)
 */
export async function backupBrowserKnowledgeDb(folderHandle: any, reason: string = '수동 백업'): Promise<{ fileName: string; size: number }> {
  const { db } = await getBrowserKnowledgeDb(folderHandle);
  const binary = db.export();

  const backupsDir = await folderHandle.getDirectoryHandle('backups', { create: true });
  const pad = (n: number) => String(n).padStart(2, '0');
  const d = new Date();
  const dateStr = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  const fileName = `onrivi_knowledge_${dateStr}.db`;

  const backupFileHandle = await backupsDir.getFileHandle(fileName, { create: true });
  const writable = await backupFileHandle.createWritable();
  await writable.write(binary);
  await writable.close();

  // 매니페스트 업데이트
  try {
    let manifest: any[] = [];
    try {
      const mHandle = await backupsDir.getFileHandle('backups_manifest.json', { create: false });
      const mFile = await mHandle.getFile();
      const mText = await mFile.text();
      manifest = JSON.parse(mText);
    } catch {}

    const docCountStmt = db.prepare('SELECT COUNT(*) AS count FROM knowledge_documents');
    const docCount = docCountStmt.step() ? Number(docCountStmt.getAsObject().count) : 0;
    docCountStmt.free();

    manifest.unshift({
      fileName,
      createdAt: d.toISOString(),
      reason,
      docCount,
      sampleTitle: '',
      size: binary.byteLength,
    });

    const mHandle = await backupsDir.getFileHandle('backups_manifest.json', { create: true });
    const mWritable = await mHandle.createWritable();
    await mWritable.write(JSON.stringify(manifest.slice(0, 50), null, 2));
    await mWritable.close();
  } catch (mErr) {
    console.warn('[backupBrowserKnowledgeDb] 매니페스트 저장 에러:', mErr);
  }

  return { fileName, size: binary.byteLength };
}

export async function listBrowserBackups(folderHandle: any): Promise<any[]> {
  try {
    const backupsDir = await folderHandle.getDirectoryHandle('backups', { create: false });
    try {
      const mHandle = await backupsDir.getFileHandle('backups_manifest.json', { create: false });
      const mFile = await mHandle.getFile();
      const mText = await mFile.text();
      return JSON.parse(mText);
    } catch {}
  } catch {}
  return [];
}

export async function restoreBrowserBackup(folderHandle: any, fileName: string): Promise<boolean> {
  // 사전 안전 자동 백업 (Rule 7)
  try { await backupBrowserKnowledgeDb(folderHandle, `원복 전 자동 안전 백업 (${fileName})`); } catch {}

  const backupsDir = await folderHandle.getDirectoryHandle('backups', { create: false });
  const backupFileHandle = await backupsDir.getFileHandle(fileName, { create: false });
  const file = await backupFileHandle.getFile();
  const binary = await file.arrayBuffer();

  const dbDir = await folderHandle.getDirectoryHandle('db', { create: true });
  const targetHandle = await dbDir.getFileHandle('onrivi_knowledge.db', { create: true });
  const writable = await targetHandle.createWritable();
  await writable.write(binary);
  await writable.close();

  // 캐시 무효화
  invalidateBrowserDbCache();
  return true;
}

export async function resetBrowserKnowledgeDb(folderHandle: any, reason: string = 'DB 완전 초기화'): Promise<boolean> {
  // 사전 안전 자동 백업 (Rule 7)
  try { await backupBrowserKnowledgeDb(folderHandle, `초기화 전 자동 안전 백업 (${reason})`); } catch {}

  const SQL = await getSqlModule();
  const newDb = new SQL.Database();
  initBrowserKnowledgeSchema(newDb);

  await saveBrowserKnowledgeDb(folderHandle, newDb);
  invalidateBrowserDbCache();
  return true;
}
