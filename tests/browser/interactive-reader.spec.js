import { test, expect } from '@playwright/test';
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
      'interactive-run:fixture-pair:independent',
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
