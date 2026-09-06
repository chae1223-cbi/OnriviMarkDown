import { describe, it } from 'node:test';
import assert from 'node:assert';
import { validateKnowledgeAnalysis } from '../../../lib/knowledge/knowledgeValidator.ts';

describe('knowledgeValidator', () => {
  it('정상적인 LLM JSON 입력을 완벽하게 검증하고 정규화한다', () => {
    const raw = {
      summary: '  JWT 기반 인증 방식을 설명하는 기술 가이드입니다.  ',
      key_points: [
        '무상태 세션 관리',
        '토큰 서명 및 만료 처리',
        '리프레시 토큰 로테이션'
      ],
      document_type: 'technical',
      tags: [
        { name: '#인증', score: 95 },
        { name: 'JWT', score: 90 },
        { name: '보안', score: 120 } // 100 초과 점수 (clamp 대상)
      ],
      search_terms: ['로그인', '토큰', '세션', 'OAuth', 'Bearer']
    };

    const validated = validateKnowledgeAnalysis(raw);

    assert.strictEqual(validated.summary, 'JWT 기반 인증 방식을 설명하는 기술 가이드입니다.');
    assert.strictEqual(validated.keyPoints.length, 3);
    assert.strictEqual(validated.documentType, 'technical');
    
    // 태그 검증 (# 제거 및 100 clamp)
    assert.strictEqual(validated.tags.length, 3);
    assert.strictEqual(validated.tags[0].name, '인증');
    assert.strictEqual(validated.tags[0].score, 95);
    assert.strictEqual(validated.tags[2].name, '보안');
    assert.strictEqual(validated.tags[2].score, 100); // 120 -> 100으로 clamp

    // 확장 검색어 검증
    assert.strictEqual(validated.searchTerms.length, 5);
    assert.ok(validated.searchTerms.includes('로그인'));
  });

  it('비정상적이거나 결측된 데이터가 들어와도 기본값으로 안전하게 방어한다', () => {
    const emptyRaw = {
      summary: null,
      key_points: 'not-an-array',
      document_type: 'invalid-type',
      tags: 'invalid-tags',
      search_terms: null
    };

    const validated = validateKnowledgeAnalysis(emptyRaw);

    assert.strictEqual(validated.summary, '');
    assert.deepStrictEqual(validated.keyPoints, []);
    assert.strictEqual(validated.documentType, 'other');
    assert.deepStrictEqual(validated.tags, []);
    assert.deepStrictEqual(validated.searchTerms, []);
  });

  it('객체가 아닌 값이 들어오면 INVALID_ANALYSIS_OUTPUT 에러를 발생시킨다', () => {
    assert.throws(() => {
      validateKnowledgeAnalysis(null);
    }, /INVALID_ANALYSIS_OUTPUT/);

    assert.throws(() => {
      validateKnowledgeAnalysis('string');
    }, /INVALID_ANALYSIS_OUTPUT/);
  });
});
