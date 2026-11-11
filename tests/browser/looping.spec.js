import {readFileSync} from 'node:fs';
const bookTitles=JSON.parse(readFileSync('public/books/catalog.json','utf8')).map(book=>book.title);
import {test,expect} from '@playwright/test';
const current='.book-frame > :not([hidden]) .story-page:not([aria-hidden="true"])';
for(const speed of [0.5,1,2])for(const title of bookTitles)test(`${title} at ${speed}x: all pages still animate after a minute and across later cycles`,async({page})=>{
 test.setTimeout(120000);
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'no-preference'});
 await page.clock.install();await page.goto('/');
 const book=await page.evaluate(async title=>(await fetch('./books/catalog.json').then(r=>r.json())).find(b=>b.title===title),title);
 await page.getByRole('button',{name:`Read ${title}`,exact:true}).click();await expect(page.locator('.flip-book')).toBeVisible();
 await page.getByText('Illustration settings',{exact:true}).click();await page.getByLabel('Default speed').selectOption(String(speed));await page.getByText('Illustration settings',{exact:true}).click();
 for(const [i,entry]of book.pages.entries()){
  await expect(page.getByTestId('page-progress')).toHaveText(`${i+1} / ${book.pages.length}`);
  const illustration=page.locator(`${current} .illustration`);await expect(illustration).toHaveAttribute('data-scene-state','ready');
  await page.clock.runFor(50);await page.clock.fastForward(60000);
  const poses=entry.scene.tracks.map(()=>new Set());
  // Sample beyond the longest cycle, including rests and late-cycle motion.
  for(let n=0;n<15;n++){
   await page.clock.fastForward(617/speed);
   const values=await illustration.locator('[data-layer]').evaluateAll(els=>Object.fromEntries(els.map(el=>[el.dataset.layer,[el.getAttribute('transform'),el.getAttribute('opacity')].join('|')])));
   entry.scene.tracks.forEach((t,k)=>poses[k].add(values[t.layer]));
  }
  for(const [k,t]of entry.scene.tracks.entries())expect(poses[k].size,`page ${i+1} ${t.layer} stopped`).toBeGreaterThan(1);
  await expect(illustration).toHaveAttribute('data-playing','true');
  if(i<book.pages.length-1){await page.getByRole('button',{name:'Next page',exact:true}).click();await page.clock.runFor(600);}
 }
});
test('fullscreen spread keeps both pages looping at slow speed after a minute',async({page})=>{
 await page.setViewportSize({width:1100,height:800});await page.emulateMedia({reducedMotion:'no-preference'});await page.clock.install();await page.goto('/');
 await page.getByRole('button',{name:'Read Sleepy Mr Sloth',exact:true}).click();await expect(page.locator('.flip-book')).toBeVisible();
 await page.getByText('Illustration settings',{exact:true}).click();await page.getByLabel('Default speed').selectOption('0.5');await page.getByText('Illustration settings',{exact:true}).click();
 await page.getByRole('button',{name:'Full screen',exact:true}).click();await page.clock.runFor(50);await page.clock.fastForward(60000);
 const scenes=page.locator(`${current} .illustration`);await expect(scenes).toHaveCount(2);
 const poses=[new Set(),new Set()];
 for(let i=0;i<15;i++){await page.clock.fastForward(1234);for(let j=0;j<2;j++)poses[j].add(await scenes.nth(j).locator('[data-layer]').first().getAttribute('transform'));}
 for(let j=0;j<2;j++){expect(poses[j].size).toBeGreaterThan(1);await expect(scenes.nth(j)).toHaveAttribute('data-playing','true');}
});
