import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { 
  normalizeDocumentPath, 
  isKnowledgeDocumentRegistered, 
  triggerKnowledgeAutoSyncOnSave 
} from '../../../lib/knowledge/knowledgeAutoSync.ts';

describe('knowledgeAutoSync (에디터 저장 시 로컬 자동 재색인 엔진)', () => {
  describe('경로 정규화 및 등록 여부 판별', () => {
    it('윈도우 역슬래시 및 대소문자를 올바르게 정규화한다', () => {
      assert.strictEqual(
        normalizeDocumentPath('D:\\Workspace\\Notes\\Guide.md'),
        'd:/workspace/notes/guide.md'
      );
      assert.strictEqual(
        normalizeDocumentPath('  /docs/system/ARCH.MD  '),
        '/docs/system/arch.md'
      );
    });

    it('지식 보관함에 등록된 문서인지 정확하게 판별한다 (경로 엄격 일치 검증)', () => {
      const registeredList = [
        'D:/Workspace/Notes/SystemArchitecture.md',
        '/Users/user/Documents/API_Guide.md',
        'Meeting2026.md'
      ];

      // 1. 완벽 일치 (대소문자/슬래시 무시)
      assert.strictEqual(
        isKnowledgeDocumentRegistered('d:\\workspace\\notes\\systemarchitecture.md', registeredList),
        true
      );

      // 2. 다른 디렉토리의 동일 파일명은 미등록 문서로 안전하게 판별 (오인 재색인 차단)
      assert.strictEqual(
        isKnowledgeDocumentRegistered('C:\\OtherDir\\API_Guide.md', registeredList),
        false
      );

      // 3. 브라우저 VFS 단일 파일명 일치
      assert.strictEqual(
        isKnowledgeDocumentRegistered('Meeting2026.md', registeredList),
        true
      );

      // 4. 미등록 문서 판별
      assert.strictEqual(
        isKnowledgeDocumentRegistered('D:\\Workspace\\Notes\\Unregistered.md', registeredList),
        false
      );

      // 5. 빈 목록 방어
      assert.strictEqual(
        isKnowledgeDocumentRegistered('Test.md', []),
        false
      );
    });
  });

  describe('triggerKnowledgeAutoSyncOnSave 동작 검증', () => {
    // 가상 브라우저 환경 모킹
    let mockLocalStorage: Record<string, string> = {};
    let mockSessionStorage: Record<string, string> = {};
    let dispatchedEvents: CustomEvent[] = [];
    let fetchCalls: Array<{ url: string; options: any }> = [];

    const originalWindow = (global as any).window;
    const originalLocalStorage = (global as any).localStorage;
    const originalSessionStorage = (global as any).sessionStorage;
    const originalFetch = (global as any).fetch;

    beforeEach(() => {
      mockLocalStorage = {};
      mockSessionStorage = {};
      dispatchedEvents = [];
      fetchCalls = [];

      const storageFactory = (store: Record<string, string>) => ({
        getItem: (k: string) => (k in store ? store[k] : null),
        setItem: (k: string, v: string) => { store[k] = String(v); },
        removeItem: (k: string) => { delete store[k]; },
        clear: () => { Object.keys(store).forEach(k => delete store[k]); }
      });

      (global as any).localStorage = storageFactory(mockLocalStorage);
      (global as any).sessionStorage = storageFactory(mockSessionStorage);
      const mockDoc = {
        getElementById: () => null,
        createElement: () => ({ style: {}, appendChild: () => {}, remove: () => {} }),
        body: { appendChild: () => {} },
        documentElement: { classList: { contains: () => false } }
      };
      (global as any).document = mockDoc;
      (global as any).window = {
        dispatchEvent: (evt: any) => { dispatchedEvents.push(evt); },
        addEventListener: () => {},
        removeEventListener: () => {},
        document: mockDoc
      };

      (global as any).fetch = async (url: string, options: any) => {
        fetchCalls.push({ url, options });
        return {
          ok: true,
          json: async () => ({ ok: true, enqueued: 1 })
        };
      };
    });

    afterEach(() => {
      (global as any).window = originalWindow;
      (global as any).localStorage = originalLocalStorage;
      (global as any).sessionStorage = originalSessionStorage;
      (global as any).fetch = originalFetch;
    });

    it('자동 동기화 설정이 비활성화(false)되어 있으면 작업을 등록하지 않는다', async () => {
      (global as any).localStorage.setItem('onrivi_knowledge_auto_sync_save', 'false');

      const res = await triggerKnowledgeAutoSyncOnSave({
        filePath: 'D:/Doc.md',
        fileContent: '# Content'
      });

      assert.strictEqual(res.enqueued, false);
      assert.strictEqual(res.reason, 'AUTO_SYNC_DISABLED');
      assert.strictEqual(fetchCalls.length, 0);
    });

    it('지식 보관함에 등록되지 않은 문서 저장 시 로컬에서 0ms 즉시 무시한다', async () => {
      (global as any).localStorage.setItem('onrivi_knowledge_auto_sync_save', 'true');
      (global as any).localStorage.setItem('onrivi_registered_knowledge_docs', JSON.stringify(['Other.md']));

      const res = await triggerKnowledgeAutoSyncOnSave({
        filePath: 'D:/Workspace/Unregistered.md',
        fileContent: '# Unregistered Content'
      });

      assert.strictEqual(res.enqueued, false);
      assert.strictEqual(res.reason, 'NOT_A_KNOWLEDGE_DOC');
      assert.strictEqual(fetchCalls.length, 0);
    });

    it('내용 변경이 없는 단순 저장 시(동일 세션 해시) 큐 스팸을 차단한다', async () => {
      const filePath = 'D:/Workspace/Notes/SystemArchitecture.md';
      const fileContent = '# Same Content';

      (global as any).localStorage.setItem('onrivi_knowledge_auto_sync_save', 'true');
      (global as any).localStorage.setItem('onrivi_registered_knowledge_docs', JSON.stringify([filePath]));

      // 1회차 실행: 정상 등록
      const firstRes = await triggerKnowledgeAutoSyncOnSave({ filePath, fileContent });
      assert.strictEqual(firstRes.enqueued, true);
      assert.strictEqual(fetchCalls.length, 1);

      // 2회차 실행 (내용 동일): 세션 캐시 기반 차단
      const secondRes = await triggerKnowledgeAutoSyncOnSave({ filePath, fileContent });
      assert.strictEqual(secondRes.enqueued, false);
      assert.strictEqual(secondRes.reason, 'CONTENT_UNMODIFIED');
      assert.strictEqual(fetchCalls.length, 1); // 추가 fetch 호출 없음
    });

    it('등록된 문서 내용이 변경되면 로컬 SQLite 큐에 REINDEX(Priority 1)로 자동 등록한다', async () => {
      const filePath = 'D:/Workspace/Notes/SystemArchitecture.md';
      (global as any).localStorage.setItem('onrivi_knowledge_auto_sync_save', 'true');
      (global as any).localStorage.setItem('onrivi_registered_knowledge_docs', JSON.stringify([filePath]));
      (global as any).localStorage.setItem('resourceFolder', 'MyResource');

      const res = await triggerKnowledgeAutoSyncOnSave({
        filePath,
        fileContent: '# Updated System Architecture V2'
      });

      assert.strictEqual(res.enqueued, true);
      assert.strictEqual(fetchCalls.length, 1);
      assert.strictEqual(fetchCalls[0].url, '/api/knowledge/queue');

      const body = JSON.parse(fetchCalls[0].options.body);
      assert.strictEqual(body.action, 'ENQUEUE_BATCH');
      assert.strictEqual(body.resourceFolder, 'MyResource');
      assert.strictEqual(body.items[0].jobType, 'REINDEX');
      assert.strictEqual(body.items[0].priority, 1); // 최고 우선순위
      assert.ok(body.items[0].targetHash);

      // 전역 이벤트 브로드캐스트 확인
      assert.strictEqual(dispatchedEvents.length, 1);
      assert.strictEqual(dispatchedEvents[0].type, 'app:knowledge-auto-synced');
    });
  });
});
