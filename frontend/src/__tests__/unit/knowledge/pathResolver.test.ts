// ====================================================================
// 📊 [OMD-TEST-PATH-RESOLVER-001] pathResolver.test.ts
// 🎯 @KICK  : 웹 및 로컬 환경 지식 문서 상대경로 ➔ 디스크 절대경로 자동 승격 및 자동 치유 단위 테스트
// 🛡️ @GUARD : Rule 4 전용 디렉토리 격리, Windows/POSIX 경로 호환성, 접미사 매칭 무결성
// 🚨 @PATCH : **2026-09-13** — [규칙 9 단위 테스트 반영]: 작업장 경로(onrivi_workspace_path) 부재 시 D:/ 임의 폴백 금지 및 즉시 Error throw 검증, 블러그 작업장 직결 검증
//             **2026-09-12** — [지식 문서 등록 시 절대경로 표준화 및 자동 치유 단위 테스트 신설]
// ====================================================================

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { ensureClientAbsolutePath, resolveDiskAbsolutePath } from '../../../lib/knowledge/pathResolver';
import { isKnowledgeDocumentRegistered } from '../../../lib/knowledge/knowledgeAutoSync';

describe('Path Resolver & Knowledge Absolute Path Standardization Tests (Rule 9 Enforced)', () => {
  let originalLocalStorage: any;

  beforeEach(() => {
    originalLocalStorage = (globalThis as any).localStorage;
  });

  afterEach(() => {
    (globalThis as any).localStorage = originalLocalStorage;
  });

  // 1. ensureClientAbsolutePath 테스트
  describe('ensureClientAbsolutePath 동작 검증', () => {
    it('이미 Windows 절대 경로(D:/...)인 경우 슬래시 정규화 후 그대로 유지해야 함', () => {
      const input = 'D:\\Developer\\OnriviMarkDown\\test.md';
      const result = ensureClientAbsolutePath(input);
      assert.equal(result, 'D:/Developer/OnriviMarkDown/test.md');
    });

    it('이미 POSIX 절대 경로(/Users/...)인 경우 그대로 유지해야 함', () => {
      const input = '/Users/onrivi/documents/guide.md';
      const result = ensureClientAbsolutePath(input);
      assert.equal(result, '/Users/onrivi/documents/guide.md');
    });

    it('규칙 9: 로컬스토리지 onrivi_workspace_path가 없으면 임의 폴백(D:/ 등)하지 않고 명시적 에러를 발생시켜야 함', () => {
      (globalThis as any).localStorage = {
        getItem: () => null,
        setItem: () => {}
      };
      const input = '체험하기/추석 연휴 관련 여행지.md';
      assert.throws(() => {
        ensureClientAbsolutePath(input, null);
      }, /onrivi_workspace_path/);
    });

    it('로컬스토리지 onrivi_workspace_path에 유효한 작업장 경로가 저장되어 있으면 완전한 절대경로로 결합해야 함', () => {
      const mockStorage = new Map<string, string>();
      mockStorage.set('onrivi_workspace_path', 'C:/UserWorkspace/Docs');
      (globalThis as any).localStorage = {
        getItem: (key: string) => mockStorage.get(key) || null,
        setItem: (key: string, value: string) => { mockStorage.set(key, value); }
      };
      const input = './체험하기//여행지.md';
      const result = ensureClientAbsolutePath(input);
      assert.equal(result, 'C:/UserWorkspace/Docs/체험하기/여행지.md');
    });

    it('웹 브라우저 환경에서 드라이브 문자 없는 작업장 폴더명(블로그)도 정상 인식하여 결합해야 함', () => {
      const mockStorage = new Map<string, string>();
      mockStorage.set('onrivi_workspace_path', '블로그');
      (globalThis as any).localStorage = {
        getItem: (key: string) => mockStorage.get(key) || null,
        setItem: (key: string, value: string) => { mockStorage.set(key, value); }
      };
      const input = '체험하기/2026_추석_물가.md';
      const result = ensureClientAbsolutePath(input);
      assert.equal(result, '블로그/체험하기/2026_추석_물가.md');
    });
  });

  // 2. resolveDiskAbsolutePath 테스트
  describe('resolveDiskAbsolutePath 동작 검증', () => {
    it('Windows 절대경로 유입 시 슬래시 정규화 반환', () => {
      const p = 'D:\\Developer\\Project\\sample.md';
      assert.equal(resolveDiskAbsolutePath(p), 'D:/Developer/Project/sample.md');
    });

    it('작업장 절대경로가 전달되면 상대경로와 다이렉트 결합 반환', () => {
      const p = '체험하기/추석 연휴 관련 여행지.md';
      const res = resolveDiskAbsolutePath(p, null, 'C:/UserWorkspace/Docs');
      assert.equal(res, 'C:/UserWorkspace/Docs/체험하기/추석 연휴 관련 여행지.md');
    });

    it('규칙 9: 작업장 경로가 미지정되거나 찾을 수 없으면 D:\\ 임의 폴백 없이 즉시 에러 발생', () => {
      const p = '체험하기/추석 연휴 관련 여행지.md';
      assert.throws(() => {
        resolveDiskAbsolutePath(p, null, '존재하지않는임의작업장폴더XYZ');
      }, /작업장 절대경로/);
    });
  });

  // 3. isKnowledgeDocumentRegistered 접미사 매칭 검증
  describe('isKnowledgeDocumentRegistered 상대경로 ↔ 절대경로 양방향 매칭 검증', () => {
    it('등록 리스트에 절대경로가 있고 에디터에 상대경로가 유입되어도 접미사 일치로 true 반환해야 함', () => {
      const registeredList = [
        'D:/Developer/OnriviMarkDown/체험하기/추석 연휴 관련 여행지.md',
        'D:/Docs/Manual.md'
      ];
      const editorFilePath = '체험하기/추석 연휴 관련 여행지.md';
      assert.equal(isKnowledgeDocumentRegistered(editorFilePath, registeredList), true);
    });

    it('등록 리스트에 상대경로가 있고 에디터에 절대경로가 유입되어도 접미사 일치로 true 반환해야 함', () => {
      const registeredList = [
        '체험하기/추석 연휴 관련 여행지.md'
      ];
      const editorFilePath = 'D:/Developer/OnriviMarkDown/체험하기/추석 연휴 관련 여행지.md';
      assert.equal(isKnowledgeDocumentRegistered(editorFilePath, registeredList), true);
    });

    it('경로 구분자가 역슬래시와 슬래시로 달라도 정규화되어 일치해야 함', () => {
      const registeredList = [
        'D:\\Developer\\OnriviMarkDown\\체험하기\\추석 연휴 관련 여행지.md'
      ];
      const editorFilePath = '체험하기/추석 연휴 관련 여행지.md';
      assert.equal(isKnowledgeDocumentRegistered(editorFilePath, registeredList), true);
    });

    it('완전히 다른 문서는 false를 반환해야 함', () => {
      const registeredList = [
        'D:/Developer/OnriviMarkDown/체험하기/추석 연휴 관련 여행지.md'
      ];
      const editorFilePath = '체험하기/완전다른문서.md';
      assert.equal(isKnowledgeDocumentRegistered(editorFilePath, registeredList), false);
    });
  });
});
