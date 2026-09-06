import { describe, it } from 'node:test';
import assert from 'node:assert';
import { buildPromptContext } from '../../../lib/knowledge/contextBuilder.ts';
import type { RetrievalCandidate } from '../../../types/knowledge.ts';

describe('contextBuilder', () => {
  it('동일 문서의 청크가 3개를 초과하면 다양성(Source Diversity)을 위해 필터링한다', () => {
    const candidates: RetrievalCandidate[] = [
      {
        documentId: 'doc_1',
        chunkId: 'c1',
        filePath: 'docs/doc1.md',
        documentTitle: '문서 1',
        headingTitle: '헤딩 1',
        headingPath: '문서 1 > 헤딩 1',
        startLine: 1,
        endLine: 10,
        fileHash: 'h1',
        rawBm25: -10,
        normalizedFtsScore: 100,
        tagScore: 90,
        headingScore: 100,
        priorityScore: 80,
        finalScore: 95
      },
      {
        documentId: 'doc_1',
        chunkId: 'c2',
        filePath: 'docs/doc1.md',
        documentTitle: '문서 1',
        headingTitle: '헤딩 2',
        headingPath: '문서 1 > 헤딩 2',
        startLine: 11,
        endLine: 20,
        fileHash: 'h1',
        rawBm25: -9,
        normalizedFtsScore: 90,
        tagScore: 90,
        headingScore: 80,
        priorityScore: 80,
        finalScore: 90
      },
      {
        documentId: 'doc_1',
        chunkId: 'c3',
        filePath: 'docs/doc1.md',
        documentTitle: '문서 1',
        headingTitle: '헤딩 3',
        headingPath: '문서 1 > 헤딩 3',
        startLine: 21,
        endLine: 30,
        fileHash: 'h1',
        rawBm25: -8,
        normalizedFtsScore: 80,
        tagScore: 90,
        headingScore: 80,
        priorityScore: 80,
        finalScore: 85
      },
      {
        // 동일 doc_1의 4번째 청크 (탈락 대상)
        documentId: 'doc_1',
        chunkId: 'c4',
        filePath: 'docs/doc1.md',
        documentTitle: '문서 1',
        headingTitle: '헤딩 4',
        headingPath: '문서 1 > 헤딩 4',
        startLine: 31,
        endLine: 40,
        fileHash: 'h1',
        rawBm25: -7,
        normalizedFtsScore: 70,
        tagScore: 90,
        headingScore: 70,
        priorityScore: 80,
        finalScore: 80
      },
      {
        // doc_2의 청크 (채택 대상)
        documentId: 'doc_2',
        chunkId: 'c5',
        filePath: 'docs/doc2.md',
        documentTitle: '문서 2',
        headingTitle: '개요',
        headingPath: '문서 2 > 개요',
        startLine: 1,
        endLine: 10,
        fileHash: 'h2',
        rawBm25: -6,
        normalizedFtsScore: 60,
        tagScore: 70,
        headingScore: 60,
        priorityScore: 60,
        finalScore: 70
      }
    ];

    const result = buildPromptContext(
      candidates,
      (path, start, end) => `텍스트 내용 (${path}: L${start}~L${end})`
    );

    // doc_1에서 3개 + doc_2에서 1개 = 총 4개 채택
    assert.strictEqual(result.evidenceList.length, 4);
    assert.strictEqual(result.evidenceList.filter(e => e.filePath === 'docs/doc1.md').length, 3);
    assert.strictEqual(result.evidenceList.filter(e => e.filePath === 'docs/doc2.md').length, 1);
  });

  it('토큰 예산(Token Budget) 초과 시 추가 청크를 안전하게 차단한다', () => {
    const candidates: RetrievalCandidate[] = [
      {
        documentId: 'doc_big_1',
        chunkId: 'cb1',
        filePath: 'docs/big1.md',
        documentTitle: '대형 문서 1',
        headingTitle: '대형 섹션 1',
        headingPath: '대형 섹션 1',
        startLine: 1,
        endLine: 100,
        fileHash: 'hb1',
        rawBm25: -10,
        normalizedFtsScore: 100,
        tagScore: 90,
        headingScore: 100,
        priorityScore: 80,
        finalScore: 95
      },
      {
        documentId: 'doc_big_2',
        chunkId: 'cb2',
        filePath: 'docs/big2.md',
        documentTitle: '대형 문서 2',
        headingTitle: '대형 섹션 2',
        headingPath: '대형 섹션 2',
        startLine: 1,
        endLine: 100,
        fileHash: 'hb2',
        rawBm25: -9,
        normalizedFtsScore: 90,
        tagScore: 90,
        headingScore: 100,
        priorityScore: 80,
        finalScore: 90
      }
    ];

    // 첫 번째 청크는 300자, 두 번째도 300자
    const mockReader = () => 'A'.repeat(300);

    // 예산을 400자로 제한 (1개만 들어가야 함)
    const result = buildPromptContext(candidates, mockReader, 400);

    assert.strictEqual(result.evidenceList.length, 1);
    assert.strictEqual(result.evidenceList[0].chunkId, undefined);
    assert.strictEqual(result.evidenceList[0].filePath, 'docs/big1.md');
  });
});
