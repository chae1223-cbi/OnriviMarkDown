import { describe, it } from 'node:test';
import assert from 'node:assert';
import { classifyScannedDocuments, flattenFileTreeNodes } from '../../../lib/knowledge/documentScanner.ts';

import CryptoJS from 'crypto-js';

describe('documentScanner', () => {
  it('신규, 변경, 동일, 미지원 마크다운 문서를 정확히 분류하고 통계를 산출한다', () => {
    const sameContent = '# 동일한 내용';
    const sameHash = CryptoJS.SHA256(sameContent).toString();

    const rawFiles = [
      { path: 'docs/new.md', name: 'new.md', content: '# 신규 문서' },
      { path: 'docs/changed.md', name: 'changed.md', content: '# 수정된 내용 v2' },
      { path: 'docs/same.md', name: 'same.md', content: sameContent },
      { path: 'images/photo.png', name: 'photo.png', content: '바이너리' },
    ];

    // DB에 이미 존재하는 가상 문서 목록
    const existingDocs = [
      { id: 'doc_1', file_path: 'docs/changed.md', file_hash: 'hash_old_v1' },
      { id: 'doc_2', file_path: 'docs/same.md', file_hash: sameHash },
    ];

    const result = classifyScannedDocuments(rawFiles, existingDocs);

    assert.strictEqual(result.totalScanned, 4);
    assert.strictEqual(result.newCount, 1);
    assert.strictEqual(result.changedCount, 1);
    assert.strictEqual(result.unsupportedCount, 1);
    assert.strictEqual(result.items.find(i => i.path === 'docs/new.md')?.category, 'NEW');
    assert.strictEqual(result.items.find(i => i.path === 'docs/changed.md')?.category, 'CHANGED');
    assert.strictEqual(result.items.find(i => i.path === 'images/photo.png')?.category, 'UNSUPPORTED');
  });

  it('중첩된 파일 트리 노드를 단일 파일 목록으로 평탄화(flatten)한다', () => {
    const tree = [
      {
        name: 'docs',
        kind: 'directory',
        children: [
          { name: 'api.md', kind: 'file', content: '# API' },
          {
            name: 'sub',
            kind: 'directory',
            children: [
              { name: 'auth.md', kind: 'file', content: '# Auth' }
            ]
          }
        ]
      }
    ];

    const flattened = flattenFileTreeNodes(tree);
    assert.strictEqual(flattened.length, 2);
    assert.strictEqual(flattened[0].name, 'api.md');
    assert.strictEqual(flattened[1].name, 'auth.md');
  });
});
