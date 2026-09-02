import { parseDynamicFrontmatter, syncPreviewFromEditorScroll, syncPreviewToTargetLine } from '../src/lib/syncEngine.ts';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('--- [1] syncPreviewFromEditorScroll Tests ---');
const c1 = {
  clientHeight: 800,
  scrollHeight: 2000,
  scrollTop: 200,
};
const ed1 = {
  getScrollTop: () => 0,
  getScrollHeight: () => 2000,
  getLayoutInfo: () => ({ height: 800 }),
  getVisibleRanges: () => [{ startLineNumber: 1 }],
};
syncPreviewFromEditorScroll(c1, ed1, '');
assert(c1.scrollTop === 0, 'Editor at top (0) -> Preview snaps to 0');

const c2 = {
  clientHeight: 800,
  scrollHeight: 2500,
  scrollTop: 500,
};
const ed2 = {
  getScrollTop: () => 1200,
  getScrollHeight: () => 2000,
  getLayoutInfo: () => ({ height: 800 }),
  getVisibleRanges: () => [{ startLineNumber: 100 }],
};
syncPreviewFromEditorScroll(c2, ed2, '');
assert(c2.scrollTop === 1700, 'Editor at bottom (1200) -> Preview snaps to bottom (2500 - 800 = 1700)');

console.log('\n--- [2] syncPreviewToTargetLine (Arrow Key Tracking) Tests ---');
const c3 = {
  clientHeight: 800,
  scrollHeight: 2000,
  scrollTop: 100,
  getBoundingClientRect: () => ({ top: 0, bottom: 800 }),
  querySelectorAll: () => [
    { getAttribute: () => '10', getBoundingClientRect: () => ({ top: 300, bottom: 350 }) }
  ],
};
syncPreviewToTargetLine(c3, 10, '# test');
assert(c3.scrollTop === 100, 'Inside Safe Zone (300-350px) -> Scroll untouched (100px)');

const c4 = {
  clientHeight: 800,
  scrollHeight: 2000,
  scrollTop: 100,
  getBoundingClientRect: () => ({ top: 0, bottom: 800 }),
  querySelectorAll: () => [
    { getAttribute: () => '20', getBoundingClientRect: () => ({ top: 750, bottom: 790 }) } // bottom: 790 > BOTTOM_SAFE(720) -> delta = 70
  ],
};
syncPreviewToTargetLine(c4, 20, '# test');
assert(c4.scrollTop === 170, 'ArrowDown beyond bottom safe line -> smoothly follows (100 -> 170)');

console.log(`\n========================================`);
console.log(`🎯 Test Result: ${passed} Passed, ${failed} Failed`);
console.log(`========================================\n`);

if (failed > 0) process.exit(1);
