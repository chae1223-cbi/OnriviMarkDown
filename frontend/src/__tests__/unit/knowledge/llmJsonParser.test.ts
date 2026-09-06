import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  extractBalancedJsonBlocks,
  repairJsonString,
  parseAndRepairLlmJson,
} from '../../../lib/knowledge/llmJsonParser.ts';

describe('llmJsonParser', () => {
  it('정상 JSON을 올바르게 파싱한다', () => {
    const json = '{"summary": "테스트 요약", "key_points": ["항목 1"]}';
    const result = parseAndRepairLlmJson(json);
    assert.strictEqual(result.summary, '테스트 요약');
    assert.deepStrictEqual(result.key_points, ['항목 1']);
  });

  it('마크다운 코드블록(```json ... ```)을 안전하게 해제하고 파싱한다', () => {
    const raw = `
\`\`\`json
{
  "summary": "코드블록 테스트",
  "document_type": "guide"
}
\`\`\`
    `.trim();
    const result = parseAndRepairLlmJson(raw);
    assert.strictEqual(result.summary, '코드블록 테스트');
    assert.strictEqual(result.document_type, 'guide');
  });

  it('서두 및 꼬리말 사족 텍스트가 있어도 균형 잡힌 중괄호 블록을 정상 추출한다', () => {
    const raw = `
안녕하세요! 요청하신 마크다운 분석 결과를 JSON으로 출력합니다.
{
  "summary": "사족 제거 테스트",
  "key_points": ["포인트 A", "포인트 B"]
}
추가 질문이 있으시면 언제든지 문의해 주세요.
    `.trim();
    const result = parseAndRepairLlmJson(raw);
    assert.strictEqual(result.summary, '사족 제거 테스트');
    assert.strictEqual(result.key_points.length, 2);
  });

  it('Gemma 모델처럼 여러 JSON 객체로 분할 출력되거나 중간에 텍스트가 섞여 있어도 병합 파싱한다', () => {
    // 실제 사용자 환경에서 "Unexpected non-whitespace character after JSON at position 39" 오류를 유발했던 패턴
    const raw = `
{
  "summary": "연습 문서 요약"
}
Here is the rest of the metadata:
{
  "document_type": "guide",
  "tags": [{"name": "연습", "score": 90}]
}
    `.trim();
    const result = parseAndRepairLlmJson(raw);
    assert.strictEqual(result.summary, '연습 문서 요약');
    assert.strictEqual(result.document_type, 'guide');
    assert.strictEqual(result.tags[0].name, '연습');
    assert.strictEqual(result.tags[0].score, 90);
  });

  it('Gemma가 : string, : number 등의 스키마 타입명을 그대로 출력했을 때 자동 복원한다', () => {
    const raw = `
{
  "summary": string,
  "document_type": "guide",
  "tags": [
    { "name": string, "score": number }
  ]
}
    `.trim();
    const result = parseAndRepairLlmJson(raw);
    assert.strictEqual(result.summary, 'string');
    assert.strictEqual(result.document_type, 'guide');
    assert.strictEqual(result.tags[0].name, 'string');
    assert.strictEqual(result.tags[0].score, 80);
  });

  it('트레일링 콤마(Trailing Comma)가 있는 비표준 JSON을 정상 복원한다', () => {
    const raw = `
{
  "summary": "트레일링 콤마 테스트",
  "key_points": [
    "항목 1",
    "항목 2",
  ],
  "document_type": "faq",
}
    `.trim();
    const result = parseAndRepairLlmJson(raw);
    assert.strictEqual(result.summary, '트레일링 콤마 테스트');
    assert.strictEqual(result.key_points.length, 2);
    assert.strictEqual(result.document_type, 'faq');
  });

  it('따옴표가 없는 키(Unquoted keys)도 감싸서 정상 파싱한다', () => {
    const raw = `
{
  summary: "키 따옴표 누락 테스트",
  document_type: "manual"
}
    `.trim();
    const result = parseAndRepairLlmJson(raw);
    assert.strictEqual(result.summary, '키 따옴표 누락 테스트');
    assert.strictEqual(result.document_type, 'manual');
  });

  it('문자열 내부에 중괄호 { } 가 포함되어 있어도 균형 잡힌 블록을 망가뜨리지 않는다', () => {
    const raw = `
{
  "summary": "수식 {x + y} 및 코드 {const a = 1;}가 포함된 문서",
  "document_type": "code"
}
    `.trim();
    const blocks = extractBalancedJsonBlocks(raw);
    assert.strictEqual(blocks.length, 1);
    const result = parseAndRepairLlmJson(raw);
    assert.strictEqual(result.summary, '수식 {x + y} 및 코드 {const a = 1;}가 포함된 문서');
  });
});
