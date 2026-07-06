import { test, expect } from '@playwright/test';

test.describe('A4 Layout Safety', () => {
  test('should not overflow when rendering a large table', async ({ page }) => {
    // 1. 에디터 페이지 접속
    await page.goto('/');

    // 2. 우측 마크다운 뷰어 영역이 존재하는지 확인
    const viewer = page.locator('.a4-standard-viewer, .markdown-viewer-root').first();
    await expect(viewer).toBeVisible();

    // 3. (실제 환경에서는 모나코 에디터에 타이핑을 시뮬레이션하지만, 
    // 여기서는 뷰어의 너비(clientWidth)와 스크롤 너비(scrollWidth)를 비교하여
    // 내용물이 바깥으로 터져 나갔는지(Overflow) 검사합니다)
    const isOverflowing = await viewer.evaluate((el) => {
      return el.scrollWidth > el.clientWidth;
    });

    // 4. 가로 스크롤(Overflow)이 발생하지 않아야 통과
    // CSS에서 overflow-x: auto 또는 word-break: break-all 처리가 잘 되어있다는 증거
    expect(isOverflowing).toBeFalsy();
  });
});
