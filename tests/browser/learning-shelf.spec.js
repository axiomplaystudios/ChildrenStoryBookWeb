import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const learning=JSON.parse(readFileSync('public/books/catalog.json','utf8')).filter(b=>b.origin==='original');
test('learning shelf has ten originals with truthful credits and distinct covers',async({page})=>{
 await page.goto('/');expect(learning).toHaveLength(10);
 await expect(page.locator('.book-card')).toHaveCount(13);
 for(const b of learning){
  const card=page.locator('.book-card').filter({has:page.getByRole('heading',{name:b.title,exact:true})});
  await expect(card.locator('.book-category')).toHaveText('LEARN TOGETHER');
  await card.locator('summary').click();await expect(card.locator('.credits')).toContainText('AI assistance');
  await expect(card.locator('.credits a')).toHaveCount(0);
  expect(await card.locator('.cover-image').evaluate(img=>img.decode().then(()=>img.naturalWidth>0))).toBe(true);
 }
});
test('learning books complete through questions, including long alphabet and odd final spreads',async({page})=>{
 test.setTimeout(120000);await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:1100,height:800});await page.goto('/');
 for(const book of learning){
  await page.getByRole('button',{name:`Read ${book.title}`,exact:true}).click();
  for(let i=0;i<Math.ceil(book.pages.length/2)-1;i++)await page.getByRole('button',{name:'Next page',exact:true}).click();
  await page.getByRole('button',{name:'Let’s talk',exact:true}).click();
  for(let i=0;i<4;i++){
   await expect(page.getByRole('heading',{name:book.questions[i].q,exact:true})).toBeVisible();
   await page.getByRole('button',{name:'Peek at an answer',exact:true}).click();
   await expect(page.getByTestId('answer')).toHaveText(book.questions[i].a);
   await page.getByRole('button',{name:i===3?'Say goodnight':'Next question',exact:true}).click();
  }
  await page.getByRole('button',{name:'Back to the bookshelf',exact:true}).click();
  await expect(page.getByRole('button',{name:`Read ${book.title} · Finished`,exact:true})).toBeVisible();
 }
});
