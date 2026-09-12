import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeExternalFileKey } from '../../../lib/storage/externalFileStore';

test('externalFileStore - normalizeExternalFileKey unit tests', async (t) => {
  await t.test('file:/// 접두사 및 역슬래시 정규화', () => {
    const raw = 'file:///E:/ZZ 개인자료/블러그/체험하기/추억의_과자선물세트를 기억하시나요.md';
    const norm = normalizeExternalFileKey(raw);
    assert.equal(norm, 'e:/zz 개인자료/블러그/체험하기/추억의_과자선물세트를 기억하시나요.md');
  });

  await t.test('knowledge:// 접두사 정규화', () => {
    const raw = 'knowledge://doc-12345/소개.md';
    const norm = normalizeExternalFileKey(raw);
    assert.equal(norm, 'doc-12345/소개.md');
  });

  await t.test('Windows 역슬래시 경로 정규화 및 NFC 정규화', () => {
    const raw = 'E:\\ZZ 개인자료\\블러그\\체험하기\\추억의_과자선물세트를 기억하시나요.md';
    const norm = normalizeExternalFileKey(raw);
    assert.equal(norm, 'e:/zz 개인자료/블러그/체험하기/추억의_과자선물세트를 기억하시나요.md');
  });

  await t.test('빈 문자열 및 공백 방어', () => {
    assert.equal(normalizeExternalFileKey(''), '');
    assert.equal(normalizeExternalFileKey('   '), '');
  });
});
