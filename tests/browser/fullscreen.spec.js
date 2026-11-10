import { test, expect } from '@playwright/test';

async function openBook(page, title = 'Pip Finds a Friend') {
  await page.goto('/');
  await page.getByRole('button', { name: `Read ${title}`, exact: true }).click();
}
async function nextEdge(page) {
  const frame = await page.locator('.book-frame').boundingBox();
  await page.mouse.click(frame.x + frame.width - 12, frame.y + frame.height / 2);
}
async function expectFits(page) {
  const bounds = await page.locator('#reader').evaluate(reader => {
    const box = reader.getBoundingClientRect();
    const frame = reader.querySelector('.book-frame').getBoundingClientRect();
    const button = reader.querySelector('.fullscreen-toggle').getBoundingClientRect();
    return { width: box.width, height: box.height, top: box.top, left: box.left, viewportWidth: innerWidth, viewportHeight: innerHeight, frameTop: frame.top, frameLeft: frame.left, frameWidth: frame.width, frameHeight: frame.height, buttonRight: button.right, buttonTop: button.top };
  });
  expect(bounds.top).toBeCloseTo(0, 0); expect(bounds.left).toBeCloseTo(0, 0);
  expect(bounds.width).toBeCloseTo(bounds.viewportWidth, 0);
  expect(bounds.height).toBeCloseTo(bounds.viewportHeight, 0);
  expect(bounds.frameTop).toBeCloseTo(0, 0); expect(bounds.frameLeft).toBeCloseTo(0, 0);
  expect(bounds.frameWidth).toBeCloseTo(bounds.viewportWidth, 0);
  expect(bounds.frameHeight).toBeCloseTo(bounds.viewportHeight, 0);
  await expect(page.locator('.reader-controls')).toBeHidden();
  await expect(page.locator('.reader-title')).toBeHidden();
  await expect(page.getByTestId('page-progress')).toBeHidden();
  await expect(page.locator('#reader button:visible')).toHaveCount(1);
  await expect(page.locator('.page-number:visible')).toHaveCount(0);
  await expect(page.locator('.fullscreen-toggle svg')).toBeVisible();
  expect(bounds.buttonRight).toBeLessThanOrEqual(bounds.viewportWidth);
  expect(bounds.buttonTop).toBeGreaterThanOrEqual(0);
  const pages = await page.locator('.story-page:visible').evaluateAll(pages => pages.map(el => {
    const img = el.querySelector('.illustration > :not([hidden])').getBoundingClientRect();
    const p = el.querySelector('p'); const box = p.getBoundingClientRect();
    const range = document.createRange(); range.selectNodeContents(p); const text = range.getBoundingClientRect();
    return { imageHeight: img.height, top: text.top, bottom: text.bottom, boxTop: box.top, boxBottom: box.bottom };
  }));
  for (const item of pages) {
    expect(item.imageHeight).toBeGreaterThan(30);
    expect(item.top).toBeGreaterThanOrEqual(item.boxTop);
    expect(item.bottom).toBeLessThanOrEqual(item.boxBottom);
  }
}

test('native full screen enters from a tap and exits without losing the reading page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openBook(page);
  await nextEdge(page);
  await expect(page.getByTestId('page-progress')).toHaveText('2 / 8');
  await page.getByRole('button', { name: 'Full screen', exact: true }).click();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id)).toBe('reader');
  await expect(page.getByRole('button', { name: 'Exit full screen' })).toHaveAttribute('aria-pressed', 'true');
  await expectFits(page);
  await page.getByRole('button', { name: 'Exit full screen' }).click();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBe(null);
  await expect(page.getByTestId('page-progress')).toHaveText('2 / 8');
  await expect(page.locator('.topbar')).toBeVisible();
  await page.getByRole('button', { name: 'Full screen', exact: true }).click();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id)).toBe('reader');
  await page.evaluate(() => document.exitFullscreen());
  await expect(page.getByRole('button', { name: 'Full screen', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByTestId('page-progress')).toHaveText('2 / 8');
});

for (const fallback of ['unsupported', 'denied']) {
  test(`${fallback} full screen expands the reader and survives phone/tablet rotation`, async ({ page }) => {
    await page.addInitScript(mode => {
      if (mode === 'unsupported') {
        Object.defineProperty(Element.prototype, 'requestFullscreen', { value: undefined, configurable: true });
        Object.defineProperty(Element.prototype, 'webkitRequestFullscreen', { value: undefined, configurable: true });
      } else {
        Element.prototype.requestFullscreen = () => Promise.reject(new DOMException('Not allowed', 'NotAllowedError'));
      }
    }, fallback);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 390, height: 844 });
    await openBook(page, 'Sleepy Mr Sloth');
    await page.getByRole('button', { name: 'Full screen', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Exit expanded view' })).toBeVisible();
    await expect(page.locator('.fullscreen-status')).toContainText(/browser.*full screen/i);
    await expectFits(page);
    await nextEdge(page);
    await nextEdge(page);
    for (const [width, height, progress, count] of [[844, 390, '3–4 / 12', 2], [768, 1024, '3 / 12', 1], [1024, 768, '3–4 / 12', 2], [568, 320, '3–4 / 12', 2], [320, 568, '3 / 12', 1]]) {
      await page.setViewportSize({ width, height });
      await expect(page.getByTestId('page-progress')).toHaveText(progress);
      await expect(page.locator('.story-page:visible')).toHaveCount(count);
      await expectFits(page);
    }
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Full screen', exact: true })).toBeVisible();
    await expect(page.getByTestId('page-progress')).toHaveText('3 / 12');
    await expect(page.locator('body')).not.toHaveClass(/reader-expanded/);
  });
}

test('leaving a full-screen book restores the shelf and question screens', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await openBook(page);
  await page.getByRole('button', { name: 'Full screen', exact: true }).click();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id)).toBe('reader');
  await page.getByRole('button', { name: 'Exit full screen', exact: true }).click();
  await page.getByRole('button', { name: '← Bookshelf', exact: true }).click();
  await expect(page.locator('#reader')).toBeHidden();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBe(null);
  await page.getByRole('button', { name: 'Read Pip Finds a Friend', exact: true }).click();
  await page.getByRole('button', { name: 'Full screen', exact: true }).click();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id)).toBe('reader');
  for (let i = 0; i < 7; i++) await nextEdge(page);
  await nextEdge(page);
  await expect(page.getByRole('heading', { name: /What did Rabbit lose/ })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBe(null);
  await expect(page.locator('body')).not.toHaveClass(/reader-expanded/);
});

test('a delayed full-screen denial cannot expand a reader after returning to the shelf', async ({ page }) => {
  await page.addInitScript(() => {
    Element.prototype.requestFullscreen = () => new Promise((_, reject) => { window.denyFullscreen = reject; });
  });
  await openBook(page);
  await page.getByRole('button', { name: 'Full screen', exact: true }).click();
  await page.getByRole('button', { name: 'Exit full screen', exact: true }).click();
  await page.getByRole('button', { name: '← Bookshelf', exact: true }).click();
  await page.evaluate(() => window.denyFullscreen(new DOMException('Denied', 'NotAllowedError')));
  await expect(page.locator('body')).not.toHaveClass(/reader-expanded/);
  await expect(page.locator('#reader')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Read Pip Finds a Friend', exact: true })).toBeVisible();
});

test('native full screen rotates real page turns between phone and iPad layouts', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openBook(page, 'Sleepy Mr Sloth');
  await expect(page.locator('.stf__item')).toHaveCount(12);
  await nextEdge(page);
  await expect(page.getByTestId('page-progress')).toHaveText('2 / 12');
  await nextEdge(page);
  await expect(page.getByTestId('page-progress')).toHaveText('3 / 12');
  await page.getByRole('button', { name: 'Full screen', exact: true }).click();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id)).toBe('reader');
  for (const [width, height, progress, count] of [[844, 390, '3–4 / 12', 2], [768, 1024, '3 / 12', 1], [1024, 768, '3–4 / 12', 2], [390, 844, '3 / 12', 1]]) {
    await page.setViewportSize({ width, height });
    await expect(page.getByTestId('page-progress')).toHaveText(progress);
    await expect(page.locator('.flip-book .story-page:visible')).toHaveCount(count);
    await expect(page.locator('.flip-book .story-page[aria-label="Page 3"]')).toBeVisible();
    await expectFits(page);
  }
  await nextEdge(page);
  await expect(page.getByTestId('page-progress')).toHaveText('4 / 12');
});

test('every Sloth spread fits full screen on a small landscape phone', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 568, height: 320 });
  await openBook(page, 'Sleepy Mr Sloth');
  await page.getByRole('button', { name: 'Full screen', exact: true }).click();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id)).toBe('reader');
  for (let i = 0; i < 6; i++) {
    await expectFits(page);
    if (i < 5) await nextEdge(page);
  }
  await nextEdge(page);
  await expect(page.getByRole('heading', { name: /What did Mr Sloth want/ })).toBeVisible();
});

test('entering full screen mid-turn does not skip the current page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openBook(page);
  await expect(page.locator('.stf__item')).toHaveCount(8);
  await page.evaluate(() => {
    document.querySelector('[aria-label="Next page"]').click();
    document.querySelector('.fullscreen-toggle').click();
  });
  await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id)).toBe('reader');
  await page.waitForTimeout(600);
  await expect(page.getByTestId('page-progress')).toHaveText('1 / 8');
  await expect(page.locator('.flip-book .story-page:visible')).toHaveAttribute('aria-label', 'Page 1');
  await nextEdge(page);
  await expect(page.getByTestId('page-progress')).toHaveText('2 / 8');
});

for (const reducedMotion of ['reduce', 'no-preference']) {
  test(`swiping the last full-screen page reaches questions with ${reducedMotion} motion`, async ({ page, context }) => {
    await page.emulateMedia({ reducedMotion });
    await page.setViewportSize({ width: 390, height: 844 });
    await openBook(page);
    await page.getByRole('button', { name: 'Full screen', exact: true }).click();
    await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id)).toBe('reader');
    for (let i = 0; i < 7; i++) {
      await nextEdge(page);
      await expect(page.getByTestId('page-progress')).toHaveText(`${i + 2} / 8`);
    }
    const cdp = await context.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 335, y: 350 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 200, y: 350 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 70, y: 350 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect(page.getByRole('heading', { name: /What did Rabbit lose/ })).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBe(null);
    await expect(page.locator('body')).not.toHaveClass(/reader-expanded/);
  });
}
