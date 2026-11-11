import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import {
  prepareBundleFixtures,
  restoreBundleBuild,
} from './helpers/interactive-bundles.mjs';
test.beforeAll(async () => {
  await prepareBundleFixtures({ pairs: 8 });
});
test.afterAll(restoreBundleBuild);
async function open(page, edition = 'Play by Myself') {
  await page.goto('/');
  const card = page.locator('.interactive-card').first();
  await card
    .getByRole('button', { name: 'Download story', exact: true })
    .click();
  await expect(card).toContainText('Ready offline');
  await card.getByRole('button', { name: edition, exact: true }).click();
}
test('single scene keyboard placements, replay, experiments, choices, discovery and recap', async ({
  page,
}) => {
  await open(page);
  await expect(page.locator('.interactive-scene')).toHaveCount(1);
  await page.getByRole('button', { name: 'Show me', exact: true }).click();
  await expect(page.locator('.demonstration')).toContainText(
    'Look at the round bun.',
  );
  await page
    .getByRole('button', { name: 'One bun, copy 1', exact: true })
    .focus();
  await page.keyboard.press('Enter');
  await page
    .getByRole('button', { name: 'Box for one bun', exact: true })
    .focus();
  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('button', { name: 'Next scene', exact: true }),
  ).toBeEnabled();
  await page.getByRole('button', { name: 'Next scene', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Test', exact: true }),
  ).toBeDisabled();
  await page.getByRole('button', { name: 'Steeper ramp', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Test', exact: true }),
  ).toBeDisabled();
  await page.getByRole('button', { name: 'Near line', exact: true }).click();
  await page.getByRole('button', { name: 'Test', exact: true }).click();
  await expect(page.locator('.trial-history')).toContainText(
    'The cart rolls farther.',
  );
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await page.getByRole('button', { name: 'Gentle ramp', exact: true }).click();
  await page.getByRole('button', { name: 'Far line', exact: true }).click();
  await page.getByRole('button', { name: 'Test', exact: true }).click();
  await expect(page.locator('.trial-history li')).toHaveCount(2);
  await page.getByRole('button', { name: 'Next scene', exact: true }).click();
  await page.getByRole('button', { name: 'Canopy', exact: true }).click();
  await expect(page.locator('.activity-feedback')).toContainText(
    'The cloth makes shade.',
  );
  await page.getByRole('button', { name: 'Open sky', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Confirm change', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Keep my choice', exact: true })
    .click();
  await page.getByRole('button', { name: 'Next scene', exact: true }).click();
  await page.getByRole('button', { name: 'Square shape', exact: true }).click();
  await page.getByRole('button', { name: 'Check answer', exact: true }).click();
  await expect(page.locator('.activity-feedback')).toContainText(
    'Try another way.',
  );
  await page.getByRole('button', { name: 'Round shape', exact: true }).click();
  await page.getByRole('button', { name: 'Check answer', exact: true }).click();
  await page.getByRole('button', { name: 'Next scene', exact: true }).click();
  await expect(page.locator('.interactive-ending')).toContainText(
    'The canopy keeps our box shaded.',
  );
  await expect(page.locator('.interactive-ending')).toContainText(
    'We made a welcome together.',
  );
  await expect(page.locator('.interactive-scene')).toHaveCount(1);
  await page.getByRole('button', { name: 'Bookshelf', exact: true }).click();
  await page
    .locator('.interactive-card')
    .first()
    .getByRole('button', { name: 'Play by Myself', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Resume story', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Resume story', exact: true }).click();
  await expect(page.locator('.interactive-ending')).toBeVisible();
});
test('double taps consume one identified copy, pointer dragging completes another and gestures never navigate', async ({
  page,
}) => {
  await page.goto('/');
  const card = page.locator('.interactive-card').nth(1);
  await card
    .getByRole('button', { name: 'Download story', exact: true })
    .click();
  await expect(card).toContainText('Ready offline');
  await card
    .getByRole('button', { name: 'Read Together', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'One bun, copy 1', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Box for one bun', exact: true })
    .dblclick();
  await expect(
    page.getByRole('button', { name: 'Next scene', exact: true }),
  ).toBeDisabled();
  await expect(page.locator('.interactive-scene')).toHaveAttribute(
    'data-scene-id',
    'scene-1',
  );
  await page
    .getByRole('button', { name: 'One bun, copy 2', exact: true })
    .scrollIntoViewIfNeeded();
  const piece = await page
      .getByRole('button', { name: 'One bun, copy 2', exact: true })
      .boundingBox(),
    target = await page
      .getByRole('button', { name: 'Box for one bun', exact: true })
      .boundingBox();
  await page.mouse.move(piece.x + piece.width / 2, piece.y + piece.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    target.x + target.width / 2,
    target.y + target.height / 2,
    { steps: 8 },
  );
  await page.mouse.up();
  await expect(
    page.getByRole('button', { name: 'Next scene', exact: true }),
  ).toBeEnabled();
  await expect(page.locator('.interactive-scene')).toHaveAttribute(
    'data-scene-id',
    'scene-1',
  );
  const targets = await page.locator('.picture-button').evaluateAll((nodes) =>
    nodes.map((n) => ({
      w: n.getBoundingClientRect().width,
      h: n.getBoundingClientRect().height,
    })),
  );
  expect(targets.every((t) => t.w >= 48 && t.h >= 48)).toBe(true);
});
test('storage denial keeps runs across exits, reduced motion preserves choice layers and editing clears later history', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('Denied', 'SecurityError');
      },
    });
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  await page
    .getByRole('button', { name: 'One bun, copy 1', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Box for one bun', exact: true })
    .click();
  await page.getByRole('button', { name: 'Next scene', exact: true }).click();
  await page.getByRole('button', { name: 'Gentle ramp', exact: true }).click();
  await page.getByRole('button', { name: 'Near line', exact: true }).click();
  await page.getByRole('button', { name: 'Test', exact: true }).click();
  await page.getByRole('button', { name: 'Next scene', exact: true }).click();
  await page.getByRole('button', { name: 'Canopy', exact: true }).click();
  await expect(page.locator('.scene-stage')).toBeVisible();
  await expect(page.locator('[data-layer="result"]')).toHaveCSS(
    'display',
    'none',
  );
  await page.getByRole('button', { name: 'Next scene', exact: true }).click();
  await page
    .getByRole('button', { name: 'Skip this activity', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Previous scene', exact: true })
    .click();
  await page.getByRole('button', { name: 'Open sky', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Confirm change', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Confirm change', exact: true })
    .click();
  await expect(page.locator('[data-layer="result"]')).not.toHaveCSS(
    'display',
    'none',
  );
  await page.getByRole('button', { name: 'Next scene', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Next scene', exact: true }),
  ).toBeDisabled();
  await page.getByRole('button', { name: 'Bookshelf', exact: true }).click();
  await page
    .locator('.interactive-card')
    .first()
    .getByRole('button', { name: 'Play by Myself', exact: true })
    .click();
  await page.getByRole('button', { name: 'Resume story', exact: true }).click();
  await expect(page.locator('.interactive-scene')).toHaveAttribute(
    'data-scene-id',
    'scene-4',
  );
});
test('corrupt save offers explicit replacement and editions remain independent', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      `interactive-run:${location.origin}/:fixture-pair:independent`,
      '{"bad":true}',
    ),
  );
  await open(page);
  await expect(page.getByText(/saved edition is damaged/)).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Resume story', exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Start edition again', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'One bun, copy 1', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Box for one bun', exact: true })
    .click();
  await page.getByRole('button', { name: 'Bookshelf', exact: true }).click();
  await page
    .locator('.interactive-card')
    .first()
    .getByRole('button', { name: 'Read Together', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Next scene', exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole('button', { name: 'One bun, copy 1', exact: true }),
  ).toBeVisible();
});
test('sequence pictures, optional physical path, four optional prompts and fullscreen speeds work in portrait and landscape', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const card = page.locator('.interactive-card').nth(2);
  await card
    .getByRole('button', { name: 'Download story', exact: true })
    .click();
  await expect(card).toContainText('Ready offline');
  await card
    .getByRole('button', { name: 'Read Together', exact: true })
    .click();
  await page.getByRole('button', { name: 'Full screen', exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => document.fullscreenElement?.id))
    .toBe('interactive-reader');
  await page
    .locator('#interactive-reader')
    .getByText('Illustration settings', { exact: true })
    .click();
  await page
    .locator('#interactive-reader')
    .getByLabel('Default speed', { exact: true })
    .selectOption('0.5');
  await page
    .locator('#interactive-reader')
    .getByLabel('This book', { exact: true })
    .selectOption('1.5');
  await page
    .locator('#interactive-reader')
    .getByLabel('This scene', { exact: true })
    .selectOption('2');
  await expect(page.locator('.interactive-art .illustration')).toHaveAttribute(
    'data-speed',
    '2',
  );
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(page.locator('.interactive-scene')).toHaveCount(1);
  await page
    .getByRole('button', { name: 'One bun, copy 1', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Box for one bun', exact: true })
    .click();
  await page.getByRole('button', { name: 'Next scene', exact: true }).click();
  await expect(page.locator('.interactive-art .illustration')).toHaveAttribute(
    'data-speed',
    '1.5',
  );
  await page.getByRole('button', { name: 'Gentle ramp', exact: true }).click();
  await page.getByRole('button', { name: 'Near line', exact: true }).click();
  await page.getByRole('button', { name: 'Test', exact: true }).click();
  await page.getByRole('button', { name: 'Next scene', exact: true }).click();
  await page.getByRole('button', { name: 'Open sky', exact: true }).click();
  await page.getByRole('button', { name: 'Next scene', exact: true }).click();
  await expect(
    page.getByText('Ask your adult to help.', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Round shape', exact: true }).click();
  await page.getByRole('button', { name: 'Square shape', exact: true }).click();
  await page.getByRole('button', { name: 'Round shape', exact: true }).click();
  await page.getByRole('button', { name: 'Check answer', exact: true }).click();
  await page.getByRole('button', { name: 'Next scene', exact: true }).click();
  await expect(page.locator('.discussion-prompt')).toHaveCount(4);
  await expect(page.locator('.discussion-prompt[open]')).toHaveCount(0);
  await page.locator('.discussion-prompt summary').first().click();
  await expect(page.locator('.discussion-prompt img').first()).toBeVisible();
  await page.getByRole('button', { name: 'Finish story', exact: true }).click();
  await expect(page.locator('.interactive-reader')).toBeHidden();
  await expect
    .poll(() => page.evaluate(() => document.fullscreenElement))
    .toBe(null);
});

test('write-denied storage preserves the latest run across reader exits', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('No storage', 'QuotaExceededError');
    };
  });
  await open(page);
  await page
    .getByRole('button', { name: 'One bun, copy 1', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Box for one bun', exact: true })
    .click();
  await page.getByRole('button', { name: 'Bookshelf', exact: true }).click();
  await page
    .locator('.interactive-card')
    .first()
    .getByRole('button', { name: 'Play by Myself', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Resume story', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Resume story', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Next scene', exact: true }),
  ).toBeEnabled();
});

test('reduced motion keeps authored visible outcomes opaque despite decorative fade starting poses',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');const card=page.locator('.interactive-card').nth(3);await card.getByRole('button',{name:'Download story',exact:true}).click();await expect(card).toContainText('Ready offline');await card.getByRole('button',{name:'Play by Myself',exact:true}).click();
 await page.getByRole('button',{name:'One bun, copy 1',exact:true}).click();await page.getByRole('button',{name:'Box for one bun',exact:true}).click();await page.getByRole('button',{name:'Next scene',exact:true}).click();await page.getByRole('button',{name:'Gentle ramp',exact:true}).click();await page.getByRole('button',{name:'Near line',exact:true}).click();await page.getByRole('button',{name:'Test',exact:true}).click();await page.getByRole('button',{name:'Next scene',exact:true}).click();await page.getByRole('button',{name:'Open sky',exact:true}).click();
 const layer=page.locator('[data-layer="result"]');await expect(layer).toHaveAttribute('opacity','1');await expect(layer).not.toHaveAttribute('transform',/.+/);await expect(layer).not.toHaveCSS('display','none');
});

test('every active reader control including expanded illustration settings has a 48px target', async ({ page }) => {
  await open(page);
  const reader = page.locator('#interactive-reader');
  await reader.getByText('Illustration settings', { exact: true }).click();
  await reader.getByRole('button', { name: 'Show me', exact: true }).click();
  for (const viewport of [{ width: 390, height: 844 }, { width: 1024, height: 768 }]) {
    await page.setViewportSize(viewport);
    const controls = await reader.locator('button:visible, select:visible, summary:visible').evaluateAll(elements => elements.map(element => {
      const bounds = element.getBoundingClientRect();
      return { label: element.getAttribute('aria-label') || element.textContent.trim(), width: bounds.width, height: bounds.height };
    }));
    expect(controls.length).toBeGreaterThan(10);
    expect(controls.filter(control => control.width < 48 || control.height < 48)).toEqual([]);
  }
});


test('same-origin hosted copies keep resume, restart, editions and version replacement separate', async ({browser}) => {
 const context = await browser.newContext({serviceWorkers:'block'});
 const first = await context.newPage(), second = await context.newPage();
 const origin = 'http://127.0.0.1:4173';
 const firstBase = `${origin}/copies/first/`, secondBase = `${origin}/copies/second/`;
 let secondUpdated = false;
 await context.route('**/copies/**', async route => {
  const pathname = new URL(route.request().url()).pathname;
  const relative = pathname.replace(/^\/copies\/(first|second)\//, '') || 'index.html';
  let body = await readFile(`dist/${relative}`);
  if (secondUpdated && pathname.startsWith('/copies/second/') && relative === 'interactive/catalog.json') {
   const catalog = JSON.parse(body);
   const manifest = await readFile('dist/interactive/fixture-pair/v2/bundle.json');
   const {createHash} = await import('node:crypto');
   const parsed = JSON.parse(manifest);
   Object.assign(catalog[0], {version:'v2',manifestUrl:'./fixture-pair/v2/bundle.json',manifestBytes:manifest.length,manifestSha256:createHash('sha256').update(manifest).digest('hex'),totalBytes:manifest.length+parsed.files.reduce((n,f)=>n+f.bytes,0)});
   body = Buffer.from(JSON.stringify(catalog));
  }
  const contentType = relative.endsWith('.js') ? 'text/javascript' : relative.endsWith('.css') ? 'text/css' : relative.endsWith('.svg') ? 'image/svg+xml' : relative.endsWith('.html') ? 'text/html' : 'application/json';
  await route.fulfill({body,contentType});
 });
 const card = page => page.locator('.interactive-card').first();
 const openEdition = async (page, label='Play by Myself') => card(page).getByRole('button',{name:label,exact:true}).click();
 const place = async page => {
  await page.getByRole('button',{name:'One bun, copy 1',exact:true}).click();
  await page.getByRole('button',{name:'Box for one bun',exact:true}).click();
 };
 const shelf = page => page.getByRole('button',{name:'Bookshelf',exact:true}).click();
 const next = page => page.getByRole('button',{name:'Next scene',exact:true});
 try {
  for (const [page, base] of [[first,firstBase],[second,secondBase]]) {
   await page.goto(base);
   await card(page).getByRole('button',{name:'Download story',exact:true}).click();
   await expect(card(page)).toContainText('Ready offline');
  }
  await first.evaluate(() => localStorage.setItem('interactive-run:fixture-pair:together','{"unscoped":"keep unchanged"}'));
  await openEdition(first); await place(first); await shelf(first);
  await openEdition(second);
  await expect(second.getByRole('button',{name:'Resume story',exact:true})).toHaveCount(0);
  await expect(next(second)).toBeDisabled();
  await place(second); await shelf(second);
  await second.reload(); await openEdition(second);
  await second.getByRole('button',{name:'Resume story',exact:true}).click();
  await expect(next(second)).toBeEnabled();
  await second.getByRole('button',{name:'Restart edition',exact:true}).click();
  await second.getByRole('button',{name:'Restart this edition',exact:true}).click();
  await expect(next(second)).toBeDisabled(); await shelf(second);
  await first.reload(); await openEdition(first);
  await first.getByRole('button',{name:'Resume story',exact:true}).click();
  await expect(next(first)).toBeEnabled(); await shelf(first);
  await openEdition(second,'Read Together'); await place(second); await shelf(second);
  secondUpdated = true;
  await second.getByRole('button',{name:'Update bookshelf',exact:true}).click();
  await expect(card(second)).toContainText('Update available');
  await card(second).getByRole('button',{name:'Update download',exact:true}).click();
  await expect(card(second)).toContainText('Ready offline');
  await openEdition(second);
  await expect(second.getByText(/saved edition is damaged or belongs to an older version/)).toBeVisible();
  await second.getByRole('button',{name:'Start edition again',exact:true}).click();
  await expect(next(second)).toBeDisabled();
  const records = await second.evaluate(() => Object.fromEntries(Object.entries(localStorage).filter(([key])=>key.startsWith('interactive-run:'))));
  expect(JSON.parse(records[`interactive-run:${firstBase}:fixture-pair:independent`]).actions).toHaveLength(1);
  expect(JSON.parse(records[`interactive-run:${secondBase}:fixture-pair:independent`]).pairVersion).toBe('v2');
  expect(JSON.parse(records[`interactive-run:${secondBase}:fixture-pair:together`]).pairVersion).toBe('v1');
  expect(JSON.parse(records[`interactive-run:${secondBase}:fixture-pair:together`]).actions).toHaveLength(1);
  expect(records['interactive-run:fixture-pair:together']).toBe('{"unscoped":"keep unchanged"}');
  await openEdition(first);
  await first.getByRole('button',{name:'Resume story',exact:true}).click();
  await expect(next(first)).toBeEnabled();
 } finally { await context.close(); }
});
