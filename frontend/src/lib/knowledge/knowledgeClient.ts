// ====================================================================
// 📊 [OMD-CORE-knowledgeClient-0001] knowledgeClient.ts ➔ Unified Knowledge Client Facade
// 🎯 @KICK  : 데스크톱/로컬(Node SQLite)과 프로드 웹(WASM SQLite)을 자동 감지하여 동일한 지식 인터페이스를 제공하는 통합 클라이언트 파사드
// 🛡️ @GUARD : Rule 1(문서/주석 동기화), Rule 2(대문자 코드값), Rule 7(선행 검증 후 원자적 트랜잭션 무결성), 404/405 자동 WASM 폴백
// 🚨 @PATCH : **2026-09-06** — [localhost↔prod WASM 코드경로 통일: isServerApiAvailable에서 localhost 조건 제거] 로컬 개발(localhost)도 prod(onrivi.com)와 동일하게 browserKnowledgeDb(WASM sql.js + IndexedDB) 경로를 타도록 변경 — 로컬에서 테스트한 코드가 prod에 동일하게 반영되는 신뢰성 있는 개발/배포 파이프라인 확보. Electron 데스크탑(electronAPI 보유)만 /api/knowledge/* API 라우트 사용
//             **2026-09-06** — [데스크톱 ↔ 프로드 웹 로컬 DB 일치화 파사드 구축] 데스크톱/로컬에서는 /api/knowledge/* 및 electronAPI를 사용하고, 프로드 웹(onrivi.com)에서는 browserKnowledgeDb(WASM sql.js + resourceFolderHandle)를 호출하여 사용자 PC의 Onrivi_Asset/db/onrivi_knowledge.db를 100% 동일하게 공유하도록 단일 진입점 구현
// 🔗 @CALLS : ./browserKnowledgeDb, ../indexedDbHelper
// ====================================================================

import type {
  KnowledgeDocument,
  KnowledgeDocumentDetail,
  KnowledgeCollection,
  RetrievalCandidate,
} from '../../types/knowledge';
import {
  listBrowserDocuments,
  getBrowserDocumentDetail,
  indexBrowserDocument,
  deleteBrowserDocument,
  deleteBrowserErrorDocuments,
  searchBrowserKnowledge,
  listBrowserCollections,
  upsertBrowserCollection,
  deleteBrowserCollection,
  getBrowserQueueStats,
  backupBrowserKnowledgeDb,
  listBrowserBackups,
  restoreBrowserBackup,
  resetBrowserKnowledgeDb,
  resolveResourceFolderHandle,
} from './browserKnowledgeDb';
import { idb } from '../indexedDbHelper';

/**
 * Node.js 기반 백엔드 API 라우트(/api/knowledge/*)를 사용할 수 있는 환경인지 판별합니다.
 * Electron 데스크톱 앱만 해당 — localhost(로컬 개발)와 prod 웹은 동일하게 WASM browserKnowledgeDb 경로 사용
 *
 * ⚠️ localhost를 여기서 제외한 이유:
 *   로컬 개발(localhost)도 prod(onrivi.com)와 동일한 WASM/IndexedDB 코드 경로를 타야
 *   로컬에서 테스트한 결과가 prod에 그대로 반영되는 신뢰성 있는 파이프라인이 됩니다.
 */
export function isServerApiAvailable(): boolean {
  if (typeof window === 'undefined') return true; // SSR 환경
  return !!(window as any).electronAPI;           // Electron 데스크탑만 true
}

/**
 * 지식 DB를 사용할 수 있는 상태인지 검사합니다 (데스크톱, 로컬, 또는 브라우저 리소스 폴더 핸들 보유 시 true)
 */
export async function canAccessKnowledgeDb(explicitHandle?: any): Promise<boolean> {
  if (isServerApiAvailable()) return true;
  const handle = await resolveResourceFolderHandle(explicitHandle);
  return Boolean(handle);
}

export const knowledgeClient = {
  /**
   * 1. 문서 목록 조회
   */
  async listDocuments(params: {
    resourceFolder?: string | null;
    geminiApiKey?: string | null;
    planCode?: string | null;
    resourceFolderHandle?: any;
  }): Promise<KnowledgeDocument[]> {
    if (isServerApiAvailable()) {
      try {
        const res = await fetch('/api/knowledge/list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resourceFolder: params.resourceFolder,
            geminiApiKey: params.geminiApiKey,
            planCode: params.planCode,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.ok && Array.isArray(data.documents)) {
            return data.documents.map((d: any) => ({
              id: d.id,
              collectionId: d.collection_id || null,
              filePath: d.filePath || d.file_path || '',
              title: d.title || (d.filePath || d.file_path || '').split(/[/\\]/).pop() || '무제',
              fileHash: d.fileHash || d.file_hash || '',
              fileSize: d.fileSize || d.file_size || 0,
              modifiedAt: d.modifiedAt || d.modified_at || new Date().toISOString(),
              summary: d.summary || '',
              keyPoints: typeof d.key_points === 'string' ? JSON.parse(d.key_points || '[]') : (d.key_points || []),
              documentType: d.document_type || 'other',
              priority: d.priority || 3,
              status: d.status || 'READY',
              chunksCount: d.chunk_count || d.chunksCount || 0,
              analysisVersion: 1,
              analyzerModel: d.analyzer_model || '',
            }));
          }
        }
      } catch (err) {
        console.warn('[knowledgeClient.listDocuments] Server API failed, attempting WASM fallback:', err);
      }
    }

    // 웹 WASM SQLite 엔진 호출 (Cloudflare Pages 또는 서버 405 폴백)
    return await listBrowserDocuments(params.resourceFolderHandle);
  },

  /**
   * 2. 문서 상세 정보 조회
   */
  async getDocumentDetail(params: {
    documentId?: string;
    filePath?: string;
    resourceFolder?: string | null;
    geminiApiKey?: string | null;
    planCode?: string | null;
    resourceFolderHandle?: any;
  }): Promise<KnowledgeDocumentDetail | null> {
    if (isServerApiAvailable()) {
      try {
        const queryParams = new URLSearchParams();
        if (params.documentId) queryParams.set('docId', params.documentId);
        if (params.filePath) queryParams.set('filePath', params.filePath);
        if (params.resourceFolder) queryParams.set('resourceFolder', params.resourceFolder);

        const res = await fetch(`/api/knowledge/detail?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.ok && data.detail) return data.detail;
        }
      } catch (err) {
        console.warn('[knowledgeClient.getDocumentDetail] Server API failed, attempting WASM fallback:', err);
      }
    }

    return await getBrowserDocumentDetail(
      { documentId: params.documentId, filePath: params.filePath },
      params.resourceFolderHandle
    );
  },

  /**
   * 3. 단일 마크다운 문서 등록 및 AI 분석
   */
  async indexDocument(params: {
    filePath: string;
    fileContent: string;
    title?: string;
    resourceFolder?: string | null;
    geminiApiKey?: string | null;
    planCode?: string | null;
    aiModelName?: string | null;
    resourceFolderHandle?: any;
  }): Promise<{ documentId: string; chunksCount: number; detail: KnowledgeDocumentDetail }> {
    // 데스크톱 electronAPI 전용 가속 우선 시도
    if (typeof window !== 'undefined' && (window as any).electronAPI?.indexKnowledgeDocument) {
      const deskRes = await (window as any).electronAPI.indexKnowledgeDocument({
        filePath: params.filePath,
        fileContent: params.fileContent,
        title: params.title,
        resourceFolder: params.resourceFolder,
        geminiApiKey: params.geminiApiKey,
        planCode: params.planCode,
      });
      if (deskRes?.ok && deskRes?.detail) {
        return {
          documentId: deskRes.documentId,
          chunksCount: deskRes.chunksCount || deskRes.detail.chunksCount,
          detail: deskRes.detail,
        };
      }
    }

    if (isServerApiAvailable()) {
      try {
        const res = await fetch('/api/knowledge/index', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });
        const data = await res.json();
        if (res.ok && data.ok && data.detail) {
          return {
            documentId: data.documentId,
            chunksCount: data.chunksCount || data.detail.chunksCount,
            detail: data.detail,
          };
        }
      } catch (err) {
        console.warn('[knowledgeClient.indexDocument] Server API failed, attempting WASM fallback:', err);
      }
    }

    // 웹 WASM SQLite 엔진 호출
    return await indexBrowserDocument(params, params.resourceFolderHandle);
  },

  /**
   * 4. 문서 삭제
   */
  async deleteDocument(params: {
    documentId?: string;
    filePath?: string;
    resourceFolder?: string | null;
    geminiApiKey?: string | null;
    planCode?: string | null;
    resourceFolderHandle?: any;
  }): Promise<boolean> {
    if (isServerApiAvailable()) {
      try {
        const res = await fetch('/api/knowledge/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });
        const data = await res.json();
        if (res.ok && data.ok) return true;
      } catch (err) {
        console.warn('[knowledgeClient.deleteDocument] Server API failed, attempting WASM fallback:', err);
      }
    }

    return await deleteBrowserDocument(
      { documentId: params.documentId, filePath: params.filePath },
      params.resourceFolderHandle
    );
  },

  /**
   * 5. 오류 문서 일괄 삭제
   */
  async deleteErrorDocuments(params: {
    resourceFolder?: string | null;
    geminiApiKey?: string | null;
    planCode?: string | null;
    resourceFolderHandle?: any;
  }): Promise<number> {
    if (isServerApiAvailable()) {
      try {
        const res = await fetch('/api/knowledge/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...params, deleteErrorsOnly: true }),
        });
        const data = await res.json();
        if (res.ok && data.ok) return data.deletedCount || 0;
      } catch (err) {
        console.warn('[knowledgeClient.deleteErrorDocuments] Server API failed, attempting WASM fallback:', err);
      }
    }

    return await deleteBrowserErrorDocuments(params.resourceFolderHandle);
  },

  /**
   * 6. 하이브리드 검색 및 질의응답
   */
  async searchKnowledge(params: {
    query: string;
    resourceFolder?: string | null;
    geminiApiKey?: string | null;
    planCode?: string | null;
    collectionId?: string;
    limit?: number;
    aiModelName?: string | null;
    resourceFolderHandle?: any;
  }): Promise<{ candidates: RetrievalCandidate[]; answer?: string }> {
    if (isServerApiAvailable()) {
      try {
        const res = await fetch('/api/knowledge/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });
        const data = await res.json();
        if (res.ok && data.ok) {
          return { candidates: data.candidates || [], answer: data.answer };
        }
      } catch (err) {
        console.warn('[knowledgeClient.searchKnowledge] Server API failed, attempting WASM fallback:', err);
      }
    }

    return await searchBrowserKnowledge(params, params.resourceFolderHandle);
  },

  /**
   * 7. 컬렉션 관리
   */
  async listCollections(params: { resourceFolder?: string | null; resourceFolderHandle?: any }): Promise<KnowledgeCollection[]> {
    if (isServerApiAvailable()) {
      try {
        const res = await fetch(`/api/knowledge/collection?resourceFolder=${encodeURIComponent(params.resourceFolder || '')}`);
        if (res.ok) {
          const data = await res.json();
          if (data.ok && Array.isArray(data.collections)) return data.collections;
        }
      } catch {}
    }
    return await listBrowserCollections(params.resourceFolderHandle);
  },

  async upsertCollection(params: {
    collection: { id?: string; name: string; description?: string; color?: string };
    resourceFolder?: string | null;
    resourceFolderHandle?: any;
  }): Promise<KnowledgeCollection> {
    if (isServerApiAvailable()) {
      try {
        const res = await fetch('/api/knowledge/collection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resourceFolder: params.resourceFolder, ...params.collection }),
        });
        const data = await res.json();
        if (res.ok && data.ok && data.collection) return data.collection;
      } catch {}
    }
    return await upsertBrowserCollection(params.collection, params.resourceFolderHandle);
  },

  async deleteCollection(params: {
    collectionId: string;
    resourceFolder?: string | null;
    resourceFolderHandle?: any;
  }): Promise<void> {
    if (isServerApiAvailable()) {
      try {
        await fetch('/api/knowledge/collection', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resourceFolder: params.resourceFolder, id: params.collectionId }),
        });
        return;
      } catch {}
    }
    await deleteBrowserCollection(params.collectionId, params.resourceFolderHandle);
  },

  /**
   * 8. 큐 통계 조회
   */
  async getQueueStats(params: { resourceFolder?: string | null; resourceFolderHandle?: any }): Promise<any> {
    if (isServerApiAvailable()) {
      try {
        const res = await fetch(`/api/knowledge/queue/stats?resourceFolder=${encodeURIComponent(params.resourceFolder || '')}`);
        if (res.ok) {
          const data = await res.json();
          if (data.ok && data.stats) return data.stats;
        }
      } catch {}
    }
    return await getBrowserQueueStats(params.resourceFolderHandle);
  },

  /**
   * 9. 백업 및 원복
   */
  async listBackups(params: { resourceFolder?: string | null; resourceFolderHandle?: any }): Promise<any[]> {
    if (isServerApiAvailable()) {
      try {
        const res = await fetch(`/api/knowledge/backup?resourceFolder=${encodeURIComponent(params.resourceFolder || '')}`);
        if (res.ok) {
          const data = await res.json();
          if (data.ok && Array.isArray(data.backups)) return data.backups;
        }
      } catch {}
    }
    return await listBrowserBackups(params.resourceFolderHandle);
  },

  async createBackup(params: { resourceFolder?: string | null; reason?: string; resourceFolderHandle?: any }): Promise<any> {
    if (isServerApiAvailable()) {
      try {
        const res = await fetch('/api/knowledge/backup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resourceFolder: params.resourceFolder, reason: params.reason }),
        });
        const data = await res.json();
        if (res.ok && data.ok) return data;
      } catch {}
    }
    return await backupBrowserKnowledgeDb(params.resourceFolderHandle, params.reason);
  },

  async restoreBackup(params: { resourceFolder?: string | null; fileName: string; resourceFolderHandle?: any }): Promise<boolean> {
    if (isServerApiAvailable()) {
      try {
        const res = await fetch('/api/knowledge/restore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resourceFolder: params.resourceFolder, backupFileName: params.fileName }),
        });
        const data = await res.json();
        if (res.ok && data.ok) return true;
      } catch {}
    }
    return await restoreBrowserBackup(params.resourceFolderHandle, params.fileName);
  },

  async resetDatabase(params: { resourceFolder?: string | null; reason?: string; resourceFolderHandle?: any }): Promise<boolean> {
    if (isServerApiAvailable()) {
      try {
        const res = await fetch('/api/knowledge/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resourceFolder: params.resourceFolder, forceReset: true, resetReason: params.reason }),
        });
        const data = await res.json();
        if (res.ok && data.ok) return true;
      } catch {}
    }
    return await resetBrowserKnowledgeDb(params.resourceFolderHandle, params.reason);
  },
};
