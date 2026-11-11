import {readFileSync} from 'node:fs';
const bookTitles=JSON.parse(readFileSync('public/books/catalog.json','utf8')).map(book=>book.title);
import {test,expect} from '@playwright/test';
const current='.book-frame > :not([hidden]) .story-page:not([aria-hidden="true"])';
for(const title of bookTitles) test(`${title}: every scene animates its named parts offline with stationary text`,async({page,context})=>{
 test.setTimeout(90000);
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/');
 const books=await page.evaluate(()=>fetch('./books/catalog.json').then(r=>r.json()));const book=books.find(b=>b.title===title);
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(r=>navigator.serviceWorker.addEventListener('controllerchange',r,{once:true}));});
 await context.setOffline(true);await page.reload();await page.getByRole('button',{name:`Read ${title}`,exact:true}).click();
 // Wait for the lazy page-turn engine to replace the initial plain reader.
 await expect(page.locator('.flip-book')).toBeVisible();
 for(const [i,entry]of book.pages.entries()){
  await expect(page.getByTestId('page-progress')).toHaveText(`${i+1} / ${book.pages.length}`);
  const scene=page.locator(`${current} .scene-stage`);await expect(scene).toBeVisible();
  const body=page.locator(`${current} p`);const text=await body.boundingBox();const back=await scene.locator('[data-background]').boundingBox();
  const target=scene.locator(`[data-layer="${entry.scene.tracks[0].layer}"]`);
  const start=await target.evaluate(el=>[el.getAttribute('transform'),el.getAttribute('opacity')].join('|'));
  await expect.poll(()=>target.evaluate(el=>[el.getAttribute('transform'),el.getAttribute('opacity')].join('|')),{timeout:6000}).not.toBe(start);
  expect(await body.boundingBox()).toEqual(text);expect(await scene.locator('[data-background]').boundingBox()).toEqual(back);
  if(i<book.pages.length-1)await page.getByRole('button',{name:'Next page',exact:true}).click();
 }
});

test('full-screen spread scenes retain registration, original dimensions and reduced-motion fallback',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/');await page.getByRole('button',{name:'Read Sleepy Mr Sloth',exact:true}).click();
 for(let i=1;i<6;i++){await page.getByRole('button',{name:'Next page',exact:true}).click();await expect(page.getByTestId('page-progress')).toHaveText(`${i+1} / 12`);}
 await page.getByRole('button',{name:'Full screen',exact:true}).click();await page.setViewportSize({width:844,height:390});
 await expect(page.locator(`${current} .scene-stage`)).toHaveCount(2);
 await expect(page.locator(`${current} .scene-stage`).last()).toHaveAttribute('viewBox','0 0 1024 976');
 for(const svg of await page.locator(`${current} .scene-stage`).all()){
  const bounds=await svg.evaluate(el=>{const box=el.getBoundingClientRect(),content=el.closest('.page-content').getBoundingClientRect();return {box:box.toJSON(),content:content.toJSON()};});
  expect(bounds.box.left).toBeGreaterThanOrEqual(bounds.content.left-1);expect(bounds.box.right).toBeLessThanOrEqual(bounds.content.right+1);
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect(page.locator('.illustration[data-playing="true"]')).toHaveCount(0);
 await expect(page.locator(`${current} img:visible`)).toHaveCount(2);
});
