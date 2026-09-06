import { describe, it } from 'node:test';
import assert from 'node:assert';
import { checkKnowledgeGuard, assertKnowledgeAccess } from '../../../lib/knowledge/knowledgeGuard.ts';

describe('knowledgeGuard', () => {
  it('리소스 폴더가 없으면 기능이 비활성화되고 NO_RESOURCE_FOLDER를 반환한다', () => {
    const res = checkKnowledgeGuard({
      resourceFolder: '',
      geminiApiKey: 'valid_api_key',
      planCode: 'APPRENTICE'
    });

    assert.strictEqual(res.canUseKnowledge, false);
    assert.strictEqual(res.hasResourceFolder, false);
    assert.strictEqual(res.blockReason, 'NO_RESOURCE_FOLDER');
    assert.match(res.blockMessage || '', /리소스 폴더/);
  });

  it('AI(Gemini)가 연결되어 있지 않으면 기능이 비활성화되고 NO_AI_CONNECTION을 반환한다', () => {
    const res = checkKnowledgeGuard({
      resourceFolder: 'D:\\Resources',
      geminiApiKey: '', // AI 미연결
      planCode: 'APPRENTICE'
    });

    assert.strictEqual(res.canUseKnowledge, false);
    assert.strictEqual(res.hasResourceFolder, true);
    assert.strictEqual(res.hasAiConnected, false);
    assert.strictEqual(res.blockReason, 'NO_AI_CONNECTION');
    assert.match(res.blockMessage || '', /AI\(Gemini\)가 연결되어 있지 않습니다/);
  });

  it('플랜이 PLAN_EDITOR인 경우 기능이 비활성화되고 NO_KNOWLEDGE_PLAN을 반환한다', () => {
    const res = checkKnowledgeGuard({
      resourceFolder: 'D:\\Resources',
      geminiApiKey: 'valid_api_key',
      planCode: 'PLAN_EDITOR'
    });

    assert.strictEqual(res.canUseKnowledge, false);
    assert.strictEqual(res.hasKnowledgePlan, false);
    assert.strictEqual(res.blockReason, 'NO_KNOWLEDGE_PLAN');
  });

  it('3대 조건(리소스 폴더, AI 연결, 플랜)이 모두 충족되면 canUseKnowledge가 true가 된다', () => {
    const res = checkKnowledgeGuard({
      resourceFolder: 'D:\\Resources',
      geminiApiKey: 'valid_api_key',
      planCode: 'APPRENTICE'
    });

    assert.strictEqual(res.canUseKnowledge, true);
    assert.strictEqual(res.hasResourceFolder, true);
    assert.strictEqual(res.hasAiConnected, true);
    assert.strictEqual(res.hasKnowledgePlan, true);
    assert.strictEqual(res.blockReason, undefined);

    // assertKnowledgeAccess 예외 미발생 검증
    assert.doesNotThrow(() => {
      assertKnowledgeAccess({
        resourceFolder: 'D:\\Resources',
        geminiApiKey: 'valid_api_key',
        planCode: 'APPRENTICE'
      });
    });
  });

  it('조건 미충족 시 assertKnowledgeAccess는 예외를 던진다', () => {
    assert.throws(() => {
      assertKnowledgeAccess({
        resourceFolder: 'D:\\Resources',
        geminiApiKey: '', // AI 없음
        planCode: 'APPRENTICE'
      });
    }, /KNOWLEDGE_ACCESS_BLOCKED/);
  });
});
