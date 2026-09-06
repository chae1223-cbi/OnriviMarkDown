import { describe, it } from 'node:test';
import assert from 'node:assert';
import { chunkMarkdownByHeadings } from '../../../lib/knowledge/markdownChunker.ts';

describe('markdownChunker', () => {
  it('헤딩이 없는 서두 문단과 하위 헤딩을 올바른 계층 경로로 분할한다', () => {
    const markdown = [
      '이것은 문서 서두 개요입니다.',
      '헤딩이 나타나기 전 텍스트입니다.',
      '',
      '# 시스템 개요',
      '시스템에 대한 전반적인 설명입니다.',
      '',
      '## 아키텍처',
      '아키텍처 레이어 설명입니다.',
      '',
      '### 저장소',
      'SQLite FTS5 및 로컬 파일 시스템을 사용합니다.',
      '',
      '## 보안 정책',
      '보안 및 라이선스 가드 정책입니다.',
    ].join('\n');

    const chunks = chunkMarkdownByHeadings('doc_1', markdown);

    assert.strictEqual(chunks.length, 5);

    // 1. 서두 개요 청크
    assert.strictEqual(chunks[0].headingTitle, '개요 (서론)');
    assert.strictEqual(chunks[0].headingLevel, 0);
    assert.strictEqual(chunks[0].startLine, 1);
    assert.strictEqual(chunks[0].endLine, 3);

    // 2. # 시스템 개요
    assert.strictEqual(chunks[1].headingTitle, '시스템 개요');
    assert.strictEqual(chunks[1].headingLevel, 1);
    assert.strictEqual(chunks[1].headingPath, '시스템 개요');
    assert.strictEqual(chunks[1].startLine, 4);
    assert.strictEqual(chunks[1].endLine, 6);

    // 3. ## 아키텍처
    assert.strictEqual(chunks[2].headingTitle, '아키텍처');
    assert.strictEqual(chunks[2].headingLevel, 2);
    assert.strictEqual(chunks[2].headingPath, '시스템 개요 > 아키텍처');
    assert.strictEqual(chunks[2].startLine, 7);
    assert.strictEqual(chunks[2].endLine, 9);

    // 4. ### 저장소
    assert.strictEqual(chunks[3].headingTitle, '저장소');
    assert.strictEqual(chunks[3].headingLevel, 3);
    assert.strictEqual(chunks[3].headingPath, '시스템 개요 > 아키텍처 > 저장소');
    assert.strictEqual(chunks[3].startLine, 10);
    assert.strictEqual(chunks[3].endLine, 12);

    // 5. ## 보안 정책 (스택이 팝되어 시스템 개요 > 보안 정책이 됨)
    assert.strictEqual(chunks[4].headingTitle, '보안 정책');
    assert.strictEqual(chunks[4].headingLevel, 2);
    assert.strictEqual(chunks[4].headingPath, '시스템 개요 > 보안 정책');
    assert.strictEqual(chunks[4].startLine, 13);
    assert.strictEqual(chunks[4].endLine, 14);
  });

  it('빈 문서 입력 시 빈 배열을 반환한다', () => {
    assert.deepStrictEqual(chunkMarkdownByHeadings('doc_empty', ''), []);
    assert.deepStrictEqual(chunkMarkdownByHeadings('doc_whitespace', '   \n\n  '), []);
  });
});
