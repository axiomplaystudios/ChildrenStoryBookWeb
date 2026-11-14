import { test, expect } from '@playwright/test';
import { createUpgradeServer, upgradeBase } from './helpers/upgrade-server.mjs';

let host;
test.beforeAll(async () => { test.setTimeout(120000); host = await createUpgradeServer(); });
test.afterAll(async () => { await host?.close(); });

// Catches lost preferences, wrong production base/scope, premature readiness,
// stale catalog refresh, broken offline reopening, and reloads during reading.
test('released legacy client upgrades on the same nested origin and retains family data', async ({ page, context }) => {
  test.setTimeout(120000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => { window.documentIdentity = crypto.randomUUID(); });
  await page.goto(host.url);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => navigator.serviceWorker.controller);
  await expect(page.locator('.book-card')).toHaveCount(13);
  await expect(page.locator('.interactive-card')).toHaveCount(0);
  await page.locator('#warm-toggle').click();
  await page.locator('#sound-toggle').click();
  await page.getByRole('button', { name: 'Read Pip Finds a Friend', exact: true }).click();
  for (let i = 0; i < 7; i++) await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await page.getByRole('button', { name: 'Let’s talk', exact: true }).click();
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Next question', exact: true }).click();
  await page.getByRole('button', { name: 'Say goodnight', exact: true }).click();
  await page.getByRole('button', { name: 'Back to the bookshelf', exact: true }).click();
  const preferences = await page.evaluate(() => localStorage.getItem('bedtime-bookshelf:v1'));
  expect(JSON.parse(preferences)).toEqual({ warm: true, sound: true, completed: ['pip-finds-a-friend'] });

  await context.setOffline(true);
  await page.reload();
  await page.getByRole('button', { name: /Read Sleepy Mr Sloth/ }).click();
  await expect(page.getByTestId('page-progress')).toBeVisible();
  await page.getByRole('button', { name: '← Bookshelf', exact: true }).click();
  await context.setOffline(false);
  host.release('current');
  await page.evaluate(async () => { const registration = await navigator.serviceWorker.ready; await registration.update(); });
  await expect(page.locator('#offline-status')).toHaveText('A bookshelf update is ready');
  // The released client's update action lives in its existing install details.
  await page.getByText('Keep your bookshelf close', { exact: true }).click();
  await page.getByRole('button', { name: 'Update bookshelf', exact: true }).click();
  await expect(page.locator('.interactive-card')).toHaveCount(8);
  await expect(page.locator('.book-card')).toHaveCount(13);
  await expect(page.locator('#warm-toggle')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#sound-toggle')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: /Read Pip Finds a Friend/ })).toHaveAccessibleName(/Finished/);
  expect(await page.evaluate(() => localStorage.getItem('bedtime-bookshelf:v1'))).toBe(preferences);
  expect(await page.evaluate(() => navigator.serviceWorker.ready.then(r => new URL(r.scope).pathname))).toBe(upgradeBase);

  const card = page.locator('.interactive-card').filter({ has: page.getByRole('heading', { name: 'Amara’s Busy Bakery', exact: true }) });
  const catalog = await page.evaluate(() => fetch('./interactive/catalog.json').then(r => r.json()));
  const bakery = catalog.find(pair => pair.id === 'amaras-busy-bakery');
  const manifestPath = `interactive/${bakery.id}/${bakery.version}/bundle.json`;
  host.failures.add(manifestPath);
  await card.getByRole('button', { name: 'Download story', exact: true }).click();
  await expect(card).toContainText('Download needs attention');
  await expect(card.getByRole('button', { name: 'Read Together', exact: true })).toBeDisabled();
  host.failures.delete(manifestPath);
  await card.getByRole('button', { name: 'Retry download', exact: true }).click();
  await expect(card).toContainText('Ready offline');
  await card.getByRole('button', { name: 'Play by Myself', exact: true }).click();
  await expect(page.locator('.interactive-reader')).toBeVisible();

  const identity = await page.evaluate(() => window.documentIdentity);
  host.release('next');
  await page.evaluate(async () => { const registration = await navigator.serviceWorker.ready; await registration.update(); });
  await expect(page.locator('#offline-status')).toHaveText('A bookshelf update is ready');
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.ready.then(r => Boolean(r.waiting)))).toBe(true);
  await expect(page.locator('.interactive-reader')).toBeVisible();
  expect(await page.evaluate(() => window.documentIdentity)).toBe(identity);
  await page.getByRole('button', { name: 'Bookshelf', exact: true }).click();
  await Promise.all([
    page.waitForEvent('load'),
    page.getByRole('button', { name: 'Update bookshelf', exact: true }).click(),
  ]);
  expect(await page.evaluate(() => window.documentIdentity)).not.toBe(identity);
  await expect(card).toContainText('Ready offline');

  host.failures.add('interactive/catalog.json');
  await page.getByRole('button', { name: 'Update bookshelf', exact: true }).click();
  await expect(page.getByText('Could not refresh interactive stories.', { exact: true })).toBeVisible();
  await expect(page.locator('.interactive-card')).toHaveCount(8);
  await expect(card).toContainText('Ready offline');
  host.failures.delete('interactive/catalog.json');
  await page.getByRole('button', { name: 'Retry story catalog', exact: true }).click();
  await expect(page.locator('.catalog-error')).toHaveCount(0);

  await context.setOffline(true);
  await page.reload();
  await expect(card).toContainText('Ready offline');
  await card.getByRole('button', { name: 'Read Together', exact: true }).click();
  await expect(page.locator('.interactive-reader')).toContainText('Read Together');
  const images = await page.locator('.interactive-scene img').evaluateAll(images => Promise.all(images.map(image => image.decode().then(() => image.naturalWidth > 0))));
  expect(images.length).toBeGreaterThan(0); expect(images.every(Boolean)).toBe(true);
  expect(await page.evaluate(() => localStorage.getItem('bedtime-bookshelf:v1'))).toBe(preferences);
  expect(host.requests.filter(path => path.startsWith('/assets/') || path === '/sw.js')).toEqual([]);
});
