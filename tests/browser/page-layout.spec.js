import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const books=JSON.parse(readFileSync('public/books/catalog.json','utf8'));
const current='.book-frame > :not([hidden]) .story-page:not([aria-hidden="true"])';
for(const title of ['Mouse’s Counting Picnic','Sleepy Mr Sloth'])test(`${title}: portrait picture sits directly above readable words`,async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.getByRole('button',{name:`Read ${title}`,exact:true}).click();
 const bounds=await page.locator(current).evaluate(el=>{const b=el.getBoundingClientRect(),p=el.querySelector('p').getBoundingClientRect(),im=el.querySelector('img'),r=im.getBoundingClientRect(),style=getComputedStyle(im),w=r.width-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight),h=w*im.naturalHeight/im.naturalWidth;return {gap:p.top-(r.top+parseFloat(style.paddingTop)+(r.height-parseFloat(style.paddingTop)-h)/2+h),top:r.top-b.top+(r.height-h)/2,bottom:p.bottom-b.bottom};});
 expect(bounds.gap).toBeLessThanOrEqual(40);expect(bounds.top).toBeLessThanOrEqual(60);expect(bounds.bottom).toBeLessThanOrEqual(0);
});
test('all reader titles fit without truncation on a phone',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 for(const b of books){await page.getByRole('button',{name:`Read ${b.title}`,exact:true}).click();const metrics=await page.locator('.reader-title').evaluate(el=>({scroll:el.scrollWidth,width:el.clientWidth,whiteSpace:getComputedStyle(el).whiteSpace}));expect(metrics.scroll,b.title).toBeLessThanOrEqual(metrics.width);expect(metrics.whiteSpace).not.toBe('nowrap');await page.getByRole('button',{name:'← Bookshelf',exact:true}).click();}
});
