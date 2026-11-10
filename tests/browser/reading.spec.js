import { test, expect } from '@playwright/test';

test('a family can read, talk, finish, and keep the completion star', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: /Read Pip Finds a Friend/ }).click();
  await expect(page.getByTestId('page-progress')).toHaveText('1 / 8');
  for (let i = 0; i < 7; i++) {
    await page.getByRole('button', { name: 'Next page', exact: true }).click();
    await expect(page.getByTestId('page-progress')).toHaveText(`${i + 2} / 8`);
  }
  await page.getByRole('button', { name: 'Let’s talk' }).click();
  await expect(page.getByRole('heading', { name: /What did Rabbit lose/ })).toBeVisible();
  await expect(page.getByTestId('answer')).toBeHidden();
  await page.getByRole('button', { name: 'Peek at an answer' }).click();
  await expect(page.getByTestId('answer')).toBeVisible();
  await page.getByRole('button', { name: 'Next question' }).click();
  await expect(page.getByTestId('answer')).toBeHidden();
  for (let i = 0; i < 2; i++) await page.getByRole('button', { name: 'Next question' }).click();
  await page.getByRole('button', { name: 'Say goodnight' }).click();
  await expect(page.getByRole('heading', { name: 'Goodnight, little dreamer.' })).toBeVisible();
  await page.getByRole('button', { name: 'Back to the bookshelf' }).click();
  await expect(page.getByRole('button', { name: /Read Pip Finds a Friend/ })).toHaveAccessibleName(/Finished/);
  await page.reload();
  await expect(page.getByRole('button', { name: /Read Pip Finds a Friend/ })).toHaveAccessibleName(/Finished/);
});

test('landscape spread, portrait rotation, reduced motion and keyboard navigation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/');
  await page.getByRole('button', { name: /Read Pip Finds a Friend/ }).click();
  await expect(page.locator('.story-page:visible')).toHaveCount(2);
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('page-progress')).toHaveText('3–4 / 8');
  await page.setViewportSize({ width: 768, height: 1024 });
  await expect(page.getByTestId('page-progress')).toHaveText('3 / 8');
  await expect(page.locator('.story-page:visible')).toHaveCount(1);
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByTestId('page-progress')).toHaveText('2 / 8');
});

test('production service worker makes every book available offline', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
  });
  await context.setOffline(true);
  await page.reload();
  await page.getByRole('button', { name: /Read Sleepy Mr Sloth/ }).click();
  await expect(page.getByTestId('page-progress')).toBeVisible();
  const images = await page.locator('.story-page img').evaluateAll(images => Promise.all(images.map(img => img.decode().then(() => img.naturalWidth > 0))));
  expect(images.every(Boolean)).toBe(true);
});

test('catalog failure offers a retry and blocked storage does not break reading', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }); });
  await page.route('**/books/catalog.json', route => route.abort());
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  await page.unroute('**/books/catalog.json');
  await page.getByRole('button', { name: 'Try again' }).click();
  await page.getByRole('button', { name: /Read Pip Finds a Friend/ }).click();
  await expect(page.getByTestId('page-progress')).toBeVisible();
});

test('real page-flip supports rotation and switching between books', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/');
  await page.getByRole('button', { name: /Read Sleepy Mr Sloth/ }).click();
  await expect(page.locator('.flip-book')).toBeVisible();
  await expect(page.locator('.stf__item')).toHaveCount(12);
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(page.getByTestId('page-progress')).toHaveText('3–4 / 12');
  await page.setViewportSize({ width: 768, height: 1024 });
  await expect(page.getByTestId('page-progress')).toHaveText('3 / 12');
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(page.getByTestId('page-progress')).toHaveText('4 / 12');
  await page.getByRole('button', { name: '← Bookshelf', exact: true }).click();
  await page.getByRole('button', { name: /Read Pip Finds a Friend/ }).click();
  await expect(page.getByTestId('page-progress')).toHaveText('1 / 8');
  await expect(page.locator('.stf__item')).toHaveCount(8);
});

test('page-turn library failure keeps a readable tap fallback', async ({ page }) => {
  await page.route('**/page-flip.browser-*.js', route => route.abort());
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: /Read Pip Finds a Friend/ }).click();
  await expect(page.locator('.plain-book')).toBeVisible();
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(page.getByTestId('page-progress')).toHaveText('2 / 8');
});

test('every story fits small phone pages without clipping text', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/');
  const catalog = await page.evaluate(() => fetch('./books/catalog.json').then(r => r.json()));
  for (const story of catalog) {
    await page.getByRole('button', { name: `Read ${story.title}`, exact: true }).click();
    for (let i = 0; i < story.pages.length; i++) {
      const metrics = await page.locator('.plain-book .story-page').evaluate(el => {
        const p = el.querySelector('p'); const range = document.createRange(); range.selectNodeContents(p);
        const text = range.getBoundingClientRect(); const bounds = p.getBoundingClientRect();
        return { textTop: text.top, top: bounds.top, textBottom: text.bottom, bottom: bounds.bottom, overflow: document.documentElement.scrollWidth > innerWidth };
      });
      expect(metrics.overflow, `${story.title} page ${i + 1} width`).toBe(false);
      expect(metrics.textTop, `${story.title} page ${i + 1} text top`).toBeGreaterThanOrEqual(metrics.top);
      expect(metrics.textBottom, `${story.title} page ${i + 1} text bottom`).toBeLessThanOrEqual(metrics.bottom);
      if (i < story.pages.length - 1) await page.getByRole('button', { name: 'Next page', exact: true }).click();
    }
    await page.getByRole('button', { name: '← Bookshelf', exact: true }).click();
  }
});

test('touch swipe turns exactly one page', async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: /Read Pip Finds a Friend/ }).click();
  await expect(page.locator('.stf__item')).toHaveCount(8);
  const cdp = await context.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 335, y: 350 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 220, y: 350 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 70, y: 350 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(page.getByTestId('page-progress')).toHaveText('2 / 8');
});

test('changing reduced motion keeps the displayed page and navigation in sync', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: /Read Pip Finds a Friend/ }).click();
  await expect(page.locator('.stf__item')).toHaveCount(8);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.plain-book')).toBeVisible();
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(page.getByTestId('page-progress')).toHaveText('3 / 8');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('.flip-book')).toBeVisible();
  const displayed = page.locator('.flip-book .story-page:visible');
  await expect(displayed).toHaveCount(1);
  await expect(displayed).toHaveAttribute('aria-label', 'Page 3');
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(page.getByTestId('page-progress')).toHaveText('4 / 8');
});

test('switching books during a turn does not carry the old animation into the new book', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: /Read Sleepy Mr Sloth/ }).click();
  await expect(page.locator('.stf__item')).toHaveCount(12);
  await page.evaluate(() => {
    document.querySelector('[aria-label="Next page"]').click();
    document.querySelector('.reader-bar button').click();
    document.querySelector('[aria-label="Read Pip Finds a Friend"]').click();
  });
  // Observe beyond the old 450ms turn, rather than only the initial frame.
  await page.waitForTimeout(700);
  await expect(page.getByTestId('page-progress')).toHaveText('1 / 8');
  await expect(page.locator('.flip-book .story-page:visible')).toHaveAttribute('aria-label', 'Page 1');
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(page.getByTestId('page-progress')).toHaveText('2 / 8');
});
