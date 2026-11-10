import { test, expect } from '@playwright/test';
const visible = '.book-frame > :not([hidden]) .story-page:not([aria-hidden="true"]) .illustration';
async function open(page) {
  await page.goto('/');
  await page.getByRole('button', {name:'Read Pip Finds a Friend',exact:true}).click();
  await page.getByText('Illustration settings', {exact:true}).click();
}
test('speed hierarchy applies separately to both spread pages and survives reload', async ({page}) => {
  await page.setViewportSize({width:1100,height:800});
  await open(page);
  await page.getByLabel('Default speed').selectOption('0.5');
  await page.getByLabel('This book').selectOption('1.5');
  await page.getByLabel('Choose page').selectOption('1');
  await page.getByLabel('This page').selectOption('2');
  await expect(page.locator(visible).nth(0)).toHaveAttribute('data-speed','1.5');
  await expect(page.locator(visible).nth(1)).toHaveAttribute('data-speed','2');
  await page.reload();
  await page.getByRole('button', {name:'Read Pip Finds a Friend',exact:true}).click();
  await expect(page.locator(visible).nth(1)).toHaveAttribute('data-speed','2');
  await page.getByText('Illustration settings', {exact:true}).click();
  await page.getByLabel('Choose page').selectOption('1');
  await page.getByLabel('This page').selectOption('');
  await expect(page.locator(visible).nth(1)).toHaveAttribute('data-speed','1.5');
  await page.getByLabel('This book').selectOption('');
  await expect(page.locator(visible).nth(1)).toHaveAttribute('data-speed','0.5');
});
test('pause and replay stay usable in fullscreen and respect reduced motion', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await open(page);
  await expect(page.locator(visible)).toHaveAttribute('data-playing','true');
  await page.getByRole('button', {name:'Pause illustrations',exact:true}).click();
  await expect(page.locator(visible)).toHaveAttribute('data-playing','false');
  await page.getByRole('button', {name:'Full screen',exact:true}).click();
  await expect(page.getByLabel('Default speed')).toBeVisible();
  await page.getByRole('button', {name:'Replay illustrations',exact:true}).click();
  await expect(page.locator(visible)).toHaveAttribute('data-playing','true');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.getByRole('button', {name:'Replay illustrations',exact:true}).click();
  await expect(page.locator(visible)).toHaveAttribute('data-playing','false');
  await expect(page.locator(`${visible} > img`)).toBeVisible();
});
