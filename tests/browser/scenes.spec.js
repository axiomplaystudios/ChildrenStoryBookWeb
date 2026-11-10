import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const current = '.book-frame > :not([hidden]) .story-page:not([aria-hidden="true"])';
const stage = `${current} .scene-stage`;
const tear = `${stage} [data-layer="tear"]`;

async function fixture(page, { failAsset = false, fallback = false, assetGate } = {}) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const books = JSON.parse(await readFile('public/books/catalog.json', 'utf8'));
  for (const book of books) for (const entry of book.pages) delete entry.scene;
  books.find(book => book.id === 'pip-finds-a-friend').pages[0].scene = { width: 720, height: 540, background: 'test-background.svg', layers: [
    { id: 'tear', image: 'test-tear.svg', x: 480, y: 365, width: 12, height: 20, pivot: [0, 0] },
  ], tracks: [{ layer: 'tear', preset: 'tear-fall', playback: 'repeat', durationMs: 1800, restMs: 1000, delayMs: 400, parameters: { distanceY: 70 } }] };
  await page.route('**/books/catalog.json', route => route.fulfill({ json: books }));
  await page.route('**/test-background.svg', route => route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="720" height="540"><rect width="720" height="540" fill="#d0ddbb"/></svg>' }));
  await page.route('**/test-tear.svg', async route => {
    if (assetGate) await assetGate;
    return failAsset ? route.abort() : route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="20"><path d="M6 0Q-6 20 6 20Q18 20 6 0" fill="#80c8dd"/></svg>' });
  });
  if (fallback) await page.route('**/page-flip.browser-*.js', route => route.abort());
  await page.goto('/');
  await page.getByRole('button', { name: 'Read Pip Finds a Friend', exact: true }).click();
}

async function moving(page) {
  await expect(page.locator(stage)).toBeVisible();
  await expect(page.locator(`${current} .illustration`)).toHaveAttribute('data-playing', 'true');
  const first = await page.locator(tear).getAttribute('transform');
  await expect.poll(() => page.locator(tear).getAttribute('transform')).not.toBe(first);
}

test('a tear falls inside a stationary illustration without moving the text', async ({ page }) => {
  await fixture(page);
  await moving(page);
  const background = await page.locator(`${stage} [data-background]`).boundingBox();
  const paragraph = await page.locator(`${current} p`).boundingBox();
  const sample = await page.locator(tear).evaluate(async el => {
    const y = () => el.transform.baseVal.consolidate()?.matrix.f || 0;
    const before = y();
    await new Promise(resolve => setTimeout(resolve, 400));
    return { before, after: y() };
  });
  expect(sample.after).toBeGreaterThan(sample.before);
  expect(await page.locator(`${stage} [data-background]`).boundingBox()).toEqual(background);
  expect(await page.locator(`${current} p`).boundingBox()).toEqual(paragraph);
});

test('scene asset failure preserves the readable original and navigation', async ({ page }) => {
  await fixture(page, { failAsset: true });
  await expect(page.locator(`${current} .illustration`)).toHaveAttribute('data-scene-state', 'fallback');
  await expect(page.locator(`${current} img`)).toBeVisible();
  await expect(page.locator(stage)).toBeHidden();
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(page.getByTestId('page-progress')).toHaveText('2 / 8');
});

test('reduced motion uses the original and resumes when allowed', async ({ page }) => {
  await fixture(page);
  await moving(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator(`${current} img`)).toBeVisible();
  await expect(page.locator(stage)).toBeHidden();
  await expect(page.locator('.illustration[data-playing="true"]')).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await moving(page);
});

test('scene controllers stop on hidden pages and survive fullscreen layout changes', async ({ page }) => {
  await fixture(page);
  await moving(page);
  await page.getByRole('button', { name: 'Full screen', exact: true }).click();
  await page.setViewportSize({ width: 844, height: 390 });
  await moving(page);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(page.getByTestId('page-progress')).toHaveText('3–4 / 8');
  await expect(page.locator('.illustration[data-playing="true"]')).toHaveCount(0);
  await page.getByRole('button', { name: '← Bookshelf', exact: true }).click();
  await expect(page.locator('.illustration[data-playing="true"]')).toHaveCount(0);
});

test('library fallback still animates parts and does not restart on resize', async ({ page }) => {
  await fixture(page, { fallback: true });
  await expect(page.locator('.plain-book')).toBeVisible();
  await moving(page);
  const handle = await page.locator(tear).elementHandle();
  await page.setViewportSize({ width: 400, height: 844 });
  expect(await handle.evaluate(el => el.isConnected)).toBe(true);
  await moving(page);
});

for (const [title, pageNumber, target] of [
  ['Pip Finds a Friend', 3, 'rabbit-tear'],
  ['Sleepy Mr Sloth', 6, 'bee-1'],
  ['Sleepy Mr Sloth', 10, 'bird-beak'],
]) test(`${title} page ${pageNumber} moves its story part and works offline`, async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
  });
  await context.setOffline(true);
  await page.reload();
  await page.getByRole('button', { name: `Read ${title}`, exact: true }).click();
  for (let n = 1; n < pageNumber; n++) {
    await page.getByRole('button', { name: 'Next page', exact: true }).click();
    await expect(page.getByTestId('page-progress')).toContainText(`${n + 1} /`);
  }
  await expect(page.locator(stage)).toBeVisible();
  const layer = page.locator(`${stage} [data-layer="${target}"]`);
  const before = await layer.getAttribute('transform');
  const backdrop = await page.locator(`${stage} [data-background]`).boundingBox();
  await expect.poll(() => layer.getAttribute('transform')).not.toBe(before);
  expect(await page.locator(`${stage} [data-background]`).boundingBox()).toEqual(backdrop);
});

test('a turning copy inherits the exact frozen layer pose without its own playback', async ({ page }) => {
  await fixture(page);
  await moving(page);
  const copy = await page.evaluate(() => {
    const source = document.querySelector('.flip-book .story-page[aria-hidden="false"] [data-layer="tear"]');
    const pose = source.getAttribute('transform');
    document.querySelector('[aria-label="Next page"]').click();
    return { pose, poses: [...document.querySelectorAll('.flip-book [data-layer="tear"]')].map(el => el.getAttribute('transform')) };
  });
  expect(copy.poses.length).toBeGreaterThanOrEqual(2);
  expect(copy.poses.every(pose => pose === copy.pose)).toBe(true);
  await expect(page.getByTestId('page-progress')).toHaveText('2 / 8');
  await expect(page.locator('.illustration[data-playing="true"]')).toHaveCount(0);
});

test('backgrounding pauses the current scene and returning resumes it', async ({ page }) => {
  await fixture(page);
  await moving(page);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.locator('.illustration[data-playing="true"]')).toHaveCount(0);
  const frozen = await page.locator(tear).getAttribute('transform');
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  expect(await page.locator(tear).getAttribute('transform')).toBe(frozen);
  await page.evaluate(() => {
    delete document.hidden;
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await moving(page);
});

test('a delayed scene load cannot restart playback after leaving the book', async ({ page }) => {
  let release;
  const pending = new Promise(resolve => release = resolve);
  await fixture(page, { assetGate: pending });
  await expect(page.locator(`${current} .illustration`)).toHaveAttribute('data-scene-state', 'loading');
  await page.getByRole('button', { name: '← Bookshelf', exact: true }).click();
  release();
  await expect(page.locator('.flip-book .illustration[data-scene-state="ready"]')).toHaveCount(1);
  await expect(page.locator('.illustration[data-playing="true"]')).toHaveCount(0);
});
