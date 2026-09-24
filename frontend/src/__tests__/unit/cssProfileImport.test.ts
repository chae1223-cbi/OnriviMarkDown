import { describe, it, expect } from 'vitest';
import { sanitizeAndParseCssProfileJson, normalizeCssProfile, DEFAULT_PROFILE } from '../../constants/cssProfile';

describe('서식 데이터 정제 및 정규화 엔진 검증', () => {
  it('마크다운 코드블록(```json ... ```)이 포함된 AI 출력 텍스트를 정상 파싱해야 한다', () => {
    const rawAiText = `
다음은 요청하신 서식 프로필 JSON입니다:
\`\`\`json
{
  "name": "AI 생성 맞춤 서식",
  "pageStyle": {
    "fontSize": "15px",
    "lineHeight": "1.7"
  },
  "rules": {
    "h1": {
      "font-size": "30px",
      "color": "#1e3a8a"
    }
  }
}
\`\`\`
위 서식을 Onrivi Author에 적용해 보세요!
`;
    const parsed = sanitizeAndParseCssProfileJson(rawAiText);
    expect(parsed).not.toBeNull();
    expect(parsed.name).toBe('AI 생성 맞춤 서식');
    expect(parsed.rules.h1['color']).toBe('#1e3a8a');
  });

  it('주석 및 trailing comma가 포함된 느슨한 JSON도 정상 파싱해야 한다', () => {
    const relaxedJson = `
{
  "name": "레거시 서식",
  // 기본 본문 스타일
  "pageStyle": {
    "fontSize": "16px",
  },
  "rules": {
    "p": {
      "color": "#333333",
    },
  },
}
`;
    const parsed = sanitizeAndParseCssProfileJson(relaxedJson);
    expect(parsed).not.toBeNull();
    expect(parsed.name).toBe('레거시 서식');
    expect(parsed.rules.p.color).toBe('#333333');
  });

  it('7대 쇼케이스 태그(각주, 수식, 표, 체크박스, 미디어 등)가 누락된 구버전 서식을 100% 자동 하이드레이션해야 한다', () => {
    const legacyProfile = {
      name: '구버전 서식 2024',
      pageStyle: {
        fontSize: '14px',
        lineHeight: '1.6'
      },
      rules: {
        h1: {
          'font-size': '26px'
        },
        p: {
          'sentence-gap': '4px',
          'word-break': 'keep-all' // 거대 공백 버그 유발 속성
        }
      }
    };

    const normalized = normalizeCssProfile(legacyProfile);

    // 1. 기본 쇼케이스 태그(각주, 수식 등)가 DEFAULT_PROFILE로부터 하이드레이션되었는지 검증
    expect(normalized.rules.footnote).toBeDefined();
    expect(normalized.rules.footnote['font-size']).toBe(DEFAULT_PROFILE.rules.footnote?.['font-size']);
    expect(normalized.rules.math).toBeDefined();
    expect(normalized.rules.math['text-align']).toBe(DEFAULT_PROFILE.rules.math?.['text-align']);
    expect(normalized.rules.table).toBeDefined();
    expect(normalized.rules.img).toBeDefined();

    // 2. 입력된 커스텀 속성은 유지되어야 함
    expect(normalized.rules.h1['font-size']).toBe('26px');
    expect(normalized.rules.p['sentence-gap']).toBe('4px');

    // 3. keep-all이 break-all로 살균 변환되었는지 검증
    expect(normalized.rules.p['word-break']).toBe('break-all');

    // 4. 구조체(hrStructure, checkboxStructure, tableStructure)가 누락 없이 보존되었는지 검증
    expect(normalized.hrStructure).toBeDefined();
    expect(normalized.checkboxStructure).toBeDefined();
    expect(normalized.tableStructure).toBeDefined();
    expect(normalized.tableStructure?.outerBorderWidth).toBe(DEFAULT_PROFILE.tableStructure?.outerBorderWidth);
    expect(normalized.hrStructure?.borderTopStyle).toBe(DEFAULT_PROFILE.hrStructure?.borderTopStyle);
  });

  it('기존 시스템 프로필 ID(system-1 등)나 중복 ID 유입 시 안전한 고유 ID로 재부여해야 한다', () => {
    const hijackedProfile = {
      id: 'system-1',
      name: '시스템 사칭 서식',
      pageStyle: { fontSize: '15px' },
      rules: {}
    };

    const existing = [DEFAULT_PROFILE];
    const normalized = normalizeCssProfile(hijackedProfile, existing);

    expect(normalized.id).not.toBe('system-1');
    expect(normalized.id.startsWith('profile-')).toBe(true);
  });

  it('불완전한 프로필을 내보낼 때 7대 쇼케이스 태그 및 페이지 스타일이 100% 완전체로 정규화되어 내보내져야 한다', () => {
    const rawCustomProfile: any = {
      id: 'profile-custom-1',
      name: '나만의 테마',
      pageStyle: {
        fontSize: '15px'
      },
      rules: {
        h1: { 'font-size': '32px', color: '#2563eb' }
      }
    };

    const exportReady = normalizeCssProfile(rawCustomProfile);

    // 내보내기 산출물 검증
    expect(exportReady.name).toBe('나만의 테마');
    expect(exportReady.pageStyle.fontFamily).toBe(DEFAULT_PROFILE.pageStyle.fontFamily);
    expect(exportReady.pageStyle.lineHeight).toBe(DEFAULT_PROFILE.pageStyle.lineHeight);
    expect(exportReady.rules.h1.color).toBe('#2563eb');
    expect(exportReady.rules.footnote).toBeDefined();
    expect(exportReady.rules.math).toBeDefined();
    expect(exportReady.rules.table).toBeDefined();
    expect(exportReady.rules.taskList).toBeDefined();
    expect(exportReady.rules.img).toBeDefined();
    expect(exportReady.rules.video).toBeDefined();
    expect(exportReady.rules.map).toBeDefined();
    expect(exportReady.hrStructure).toBeDefined();
    expect(exportReady.checkboxStructure).toBeDefined();
    expect(exportReady.tableStructure).toBeDefined();

    // JSON 직렬화 검증 (undefined 필드 없이 완전한 직렬화)
    const jsonStr = JSON.stringify(exportReady, null, 2);
    expect(jsonStr).toContain('"나만의 테마"');
    expect(jsonStr).toContain('"footnote"');
    expect(jsonStr).toContain('"math"');
  });

  it('여백이 누락되거나 빈 문자열인 경우 표준 여백(상하 18mm, 좌우 12mm, A4 세로)으로 자동 복원되어야 한다', () => {
    const profileWithMissingMargins = {
      name: '여백 누락 서식',
      pageStyle: {
        fontSize: '15px',
        marginTop: '',
        marginBottom: '',
      },
      rules: {},
    };

    const normalized = normalizeCssProfile(profileWithMissingMargins);
    expect(normalized.pageStyle.paperSize).toBe('a4');
    expect(normalized.pageStyle.orientation).toBe('portrait');
    expect(normalized.pageStyle.marginTop).toBe('18mm');
    expect(normalized.pageStyle.marginBottom).toBe('18mm');
    expect(normalized.pageStyle.marginLeft).toBe('12mm');
    expect(normalized.pageStyle.marginRight).toBe('12mm');
    expect(normalized.tableStructure?.outerBorderWidth).toBe('1px');
    expect(normalized.tableStructure?.rowBorderWidth).toBe('1px');
    expect(normalized.tableStructure?.colBorderWidth).toBe('1px');
  });
});
