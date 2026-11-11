import { writeFile } from 'node:fs/promises';
import { test, expect } from '@playwright/test';
import {
  prepareBundleFixtures,
  restoreBundleBuild,
} from './helpers/interactive-bundles.mjs';
let summaries;
test.beforeAll(async () => {
  summaries = await prepareBundleFixtures({ pairs: 8 });
});
test.afterAll(restoreBundleBuild);
test('eight pair cards retain thirteen legacy books, download and choose either edition', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('.interactive-card')).toHaveCount(8);
  await expect(page.locator('.book-card')).toHaveCount(13);
  await expect(
    page.getByRole('button', { name: 'Update bookshelf', exact: true }),
  ).toBeVisible();
  const card = page.locator('.interactive-card').first();
  await expect(card).toContainText(/\d+.*KB/);
  await card
    .getByRole('button', { name: 'Download story', exact: true })
    .click();
  await expect(card).toContainText('Ready offline');
  await expect(
    page.locator('.interactive-card button.edition-button'),
  ).toHaveCount(16);
  await card
    .getByRole('button', { name: 'Read Together', exact: true })
    .click();
  await expect(page.locator('.interactive-reader')).toBeVisible();
  await expect(page.locator('.interactive-scene')).toHaveCount(1);
  await page.getByRole('button', { name: 'Bookshelf', exact: true }).click();
  await card
    .getByRole('button', { name: 'Play by Myself', exact: true })
    .click();
  await expect(page.locator('.interactive-reader')).toContainText(
    'Play by Myself',
  );
});
test('catalog refresh failure retains persisted usable cards independently of legacy loading', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('.interactive-card')).toHaveCount(8);
  await page.route('**/interactive/catalog.json*', (r) => r.abort());
  await page.route('**/books/catalog.json', (r) => r.abort());
  await page.reload();
  await expect(page.locator('.interactive-card')).toHaveCount(8);
  await expect(
    page.getByText('Could not refresh interactive stories.'),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Update bookshelf', exact: true })
    .click();
  await expect(page.locator('.interactive-card')).toHaveCount(8);
});
test('controlled shelf bypasses stale precached catalog and failed update opens installed version', async ({
  page,
}) => {
  const original = summaries.filter((s) => s.version === 'v1');
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect
    .poll(() =>
      page.evaluate(() => Boolean(navigator.serviceWorker.controller)),
    )
    .toBe(true);
  const card = page.locator('.interactive-card').first();
  await card
    .getByRole('button', { name: 'Download story', exact: true })
    .click();
  await expect(card).toContainText('Ready offline');
  await writeFile(
    'dist/interactive/catalog.json',
    JSON.stringify([summaries[1], ...original.slice(1)]),
  );
  try {
    await page
      .getByRole('button', { name: 'Update bookshelf', exact: true })
      .click();
    await expect(card).toContainText('Update available');
    await page.route('**/fixture-pair/v2/**', (r) => r.abort());
    await card
      .getByRole('button', { name: 'Update download', exact: true })
      .click();
    await expect(card).toContainText('Your saved version is still available.');
    await card
      .getByRole('button', { name: 'Play by Myself', exact: true })
      .click();
    await expect(page.locator('.interactive-reader')).toBeVisible();
    await page
      .getByRole('button', { name: 'One bun, copy 1', exact: true })
      .click();
    await page
      .getByRole('button', { name: 'Box for one bun', exact: true })
      .click();
    expect(
      await page.evaluate(
        () =>
          JSON.parse(
            localStorage.getItem('interactive-run:fixture-pair:independent'),
          ).pairVersion,
      ),
    ).toBe('v1');
    await page.getByRole('button', { name: 'Bookshelf', exact: true }).click();
    await page
      .getByRole('button', { name: 'Update bookshelf', exact: true })
      .click();
    await expect(card).toContainText('Your saved version is still available.');
    await card
      .getByRole('button', { name: 'Play by Myself', exact: true })
      .click();
    await page
      .getByRole('button', { name: 'Resume story', exact: true })
      .click();
    await expect(
      page.getByRole('button', { name: 'Next scene', exact: true }),
    ).toBeEnabled();
  } finally {
    await writeFile('dist/interactive/catalog.json', JSON.stringify(original));
  }
});

test('interactive catalog remains available while legacy catalog is still pending', async ({
  page,
}) => {
  await page.route('**/books/catalog.json', () => {});
  await page.goto('/');
  await expect(page.locator('.interactive-card')).toHaveCount(8);
});
