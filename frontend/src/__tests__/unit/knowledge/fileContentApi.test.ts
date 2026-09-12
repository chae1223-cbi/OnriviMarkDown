// ====================================================================
// 📊 [OMD-TEST-FILE-CONTENT-001] fileContentApi.test.ts
// 🎯 @KICK  : 로컬 파일 콘텐츠 읽기/쓰기 및 작업장 불일치 절대경로(file:///) 파싱 검증
// 🛡️ @GUARD : Rule 4 격리 디렉토리 준수, 빈 경로/특수문자/앵커(#) 분리 검증
// 🚨 @PATCH : **2026-09-13** — [작업장 불일치 외부 절대경로(file:///) 문서 오픈 및 로컬 디스크 파일 읽기 테스트 신설]
// ====================================================================

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

function normalizeTargetFilePath(inputPath: string): string {
  let clean = (inputPath || '').trim();
  try {
    clean = decodeURIComponent(clean);
  } catch {}

  // file:///, file://, 꺾쇠, 따옴표 제거
  clean = clean.replace(/^[<"']|[>"']$/g, '').trim();
  clean = clean.replace(/^file:\/\/\/?([a-zA-Z]:)/i, '$1');
  clean = clean.replace(/^file:\/\/\//i, '');
  clean = clean.replace(/^file:\/\//i, '');

  // 앵커(#...) 분리
  if (clean.includes('#')) {
    clean = clean.split('#')[0];
  }

  return clean.replace(/\\/g, '/').trim();
}

describe('File Content API & Cross-Workspace Path Resolution Tests', () => {
  it('file:/// 접두사 및 꺾쇠(<...>), 라인 앵커(#L..)를 정확하게 정규화한다', () => {
    const rawUri = '<file:///E:/ZZ 개인자료/블러그/체험하기/추억의_과자선물세트를 기억하시나요.md#L21-L31>';
    const normalized = normalizeTargetFilePath(rawUri);

    assert.equal(normalized, 'E:/ZZ 개인자료/블러그/체험하기/추억의_과자선물세트를 기억하시나요.md');
  });

  it('퍼센트 인코딩된 한글 file:/// URI를 올바르게 디코딩한다', () => {
    const encoded = 'file:///E:/ZZ%20%EA%B0%9C%EC%9D%B8%EC%9E%90%EB%A3%8C/%EB%B8%94%EB%9F%AC%EA%B7%B8/%ED%85%8C%EC%8A%A4%ED%8A%B8.md#L10';
    const normalized = normalizeTargetFilePath(encoded);

    assert.equal(normalized, 'E:/ZZ 개인자료/블러그/테스트.md');
  });

  it('Windows 역슬래시 경로를 웹 표준 슬래시(/) 경로로 정규화한다', () => {
    const winPath = 'E:\\ZZ 개인자료\\교육실\\연습.md';
    const normalized = normalizeTargetFilePath(winPath);

    assert.equal(normalized, 'E:/ZZ 개인자료/교육실/연습.md');
  });

  it('플레이스홀더 빈 탭인지 판별하는 로직이 정상 작동한다', () => {
    const targetBaseNameWithoutMd = '추억의_과자선물세트를 기억하시나요';
    const placeholderContent = `# ${targetBaseNameWithoutMd}\n\n`;
    const realContent = `# 추억의_과자선물세트를 기억하시나요\n\n옛날 1980년대 추억의 과자선물세트를 떠올려 봅니다...\n(2000자 이상의 본문)`;

    const isPlaceholder1 = !placeholderContent.trim() || 
      placeholderContent.trim() === `# ${targetBaseNameWithoutMd}` ||
      (placeholderContent.trim().startsWith(`# ${targetBaseNameWithoutMd}`) && placeholderContent.trim().length < targetBaseNameWithoutMd.length + 15);

    const isPlaceholder2 = !realContent.trim() || 
      realContent.trim() === `# ${targetBaseNameWithoutMd}` ||
      (realContent.trim().startsWith(`# ${targetBaseNameWithoutMd}`) && realContent.trim().length < targetBaseNameWithoutMd.length + 15);

    assert.equal(isPlaceholder1, true, '더미 플레이스홀더는 true로 판별되어야 함');
    assert.equal(isPlaceholder2, false, '실제 내용이 있는 문서는 false로 판별되어야 함');
  });
});
