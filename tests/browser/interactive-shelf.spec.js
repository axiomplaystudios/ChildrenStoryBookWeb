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
            localStorage.getItem(`interactive-run:${location.origin}/:fixture-pair:independent`),
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

test('late legacy catalog completion preserves an already-open interactive reader',async({page})=>{
 let release;
 await page.route('**/books/catalog.json',route=>{release=()=>route.continue();});
 await page.goto('/');const card=page.locator('.interactive-card').first();await card.getByRole('button',{name:'Download story',exact:true}).click();await expect(card).toContainText('Ready offline');await card.getByRole('button',{name:'Play by Myself',exact:true}).click();
 const response=page.waitForResponse('**/books/catalog.json');await release();await (await response).finished();
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 await expect(page.locator('.interactive-reader')).toBeVisible();await expect(page.getByRole('button',{name:'One bun, copy 1',exact:true})).toBeVisible();
});


test('shelf removal reclaims every upgraded version after pins release and preserves other downloads and saves', async ({page}) => {
 const originals = summaries.filter(s => s.version === 'v1');
 await page.goto('/');
 const card = page.locator('.interactive-card').first();
 await card.getByRole('button', {name:'Download story',exact:true}).click();
 await expect(card).toContainText('Ready offline');
 const otherCard = page.locator('.interactive-card').nth(1);
 await otherCard.getByRole('button', {name:'Download story',exact:true}).click();
 await expect(otherCard).toContainText('Ready offline');
 await card.getByRole('button', {name:'Play by Myself',exact:true}).click();
 await page.getByRole('button', {name:'One bun, copy 1',exact:true}).click();
 await page.getByRole('button', {name:'Box for one bun',exact:true}).click();
 await page.getByRole('button', {name:'Bookshelf',exact:true}).click();
 const saves = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage).filter(([key]) => key.startsWith('interactive-run:'))));
 await page.evaluate(async () => {
  const {createBundleStore} = await import('/__bundle-tests.js');
  window.removalStore = createBundleStore();
  window.pinnedOld = await window.removalStore.open('fixture-pair','v1');
  window.pinnedUrl = window.pinnedOld.resolveAsset('drawing.svg');
 });
 await writeFile('dist/interactive/catalog.json', JSON.stringify([summaries[1], ...originals.slice(1)]));
 try {
  await page.getByRole('button', {name:'Update bookshelf',exact:true}).click();
  await expect(card).toContainText('Update available');
  await card.getByRole('button', {name:'Update download',exact:true}).click();
  await expect(card).toContainText('Ready offline');
  await card.getByRole('button', {name:'Remove download',exact:true}).click();
  await card.getByRole('button', {name:'Confirm removal',exact:true}).click();
  await expect(card).toContainText('Not downloaded');
  await expect(otherCard).toContainText('Ready offline');
  expect(await page.evaluate(async () => { const image = new Image(); image.src = window.pinnedUrl; await image.decode(); return image.naturalWidth; })).toBe(32);
  await page.evaluate(() => window.pinnedOld.dispose());
  await expect.poll(() => page.evaluate(async () => (await caches.keys()).filter(k => k.startsWith('interactive-bundles:') && k.includes(':fixture-pair:')).length)).toBe(0);
  for (const version of ['v1','v2']) expect(await page.evaluate(async version => { try { const bundle = await window.removalStore.open('fixture-pair',version); bundle.dispose(); return 'opened'; } catch (e) { return e.code; } }, version)).toBe('not-downloaded');
  expect(await page.evaluate(() => Object.fromEntries(Object.entries(localStorage).filter(([key]) => key.startsWith('interactive-run:'))))).toEqual(saves);
  expect(await page.evaluate(async () => { const bundle = await window.removalStore.open('fixture-pair-2','v1'); bundle.dispose(); return bundle.pair.version; })).toBe('v1');
 } finally { await writeFile('dist/interactive/catalog.json', JSON.stringify(originals)); }
});


test('retained versions stay removable when the current version has been evicted', async ({page}) => {
 await page.goto('/');
 const card = page.locator('.interactive-card').first();
 await page.evaluate(async ([v1,v2]) => {
  const {createBundleStore} = await import('/__bundle-tests.js');
  const store = createBundleStore();
  await store.install(v1); await store.install(v2);
  for (const name of await caches.keys()) if (name.startsWith('interactive-bundles:') && name.includes(':fixture-pair:v2:')) await caches.delete(name);
 }, summaries.slice(0,2));
 await page.getByRole('button',{name:'Update bookshelf',exact:true}).click();
 await expect(card).toContainText('Not downloaded');
 await card.getByRole('button',{name:'Remove download',exact:true}).click();
 await card.getByRole('button',{name:'Confirm removal',exact:true}).click();
 await expect.poll(() => page.evaluate(async () => (await caches.keys()).filter(name => name.startsWith('interactive-bundles:') && name.includes(':fixture-pair:')).length)).toBe(0);
 await expect(card.getByRole('button',{name:'Remove download',exact:true})).toHaveCount(0);
});
