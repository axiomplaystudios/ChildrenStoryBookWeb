import{test,expect}from'@playwright/test';
const recipe=[['first-plate','Soft bun',1,'Grandpa’s plate for one bun'],['two-for-the-door','Soft bun',2,'Basket for two buns'],['star-place','Star biscuit',1,'Plate beside the star card'],['three-for-the-bench','Soft bun',3,'Open box for three buns'],['four-for-friends','Star biscuit',4,'Sharing tray for four stars'],['five-for-the-table','Soft bun',5,'Sharing plate for five buns']];
const cardFor=page=>page.locator('.interactive-card').filter({has:page.getByRole('heading',{name:'Amara’s Busy Bakery',exact:true})});
async function download(page){await page.goto('/');await expect(page.locator('.book-card')).toHaveCount(13);const card=cardFor(page);await expect(card).toHaveCount(1);await card.getByRole('button',{name:'Download story',exact:true}).click();await expect(card).toContainText('Ready offline');return card;}
async function journey(page,edition,{touch=false,inspect=false}={}){
 await cardFor(page).getByRole('button',{name:edition==='together'?'Read Together':'Play by Myself',exact:true}).click();
 await expect(page.getByText(/Your adult reads aloud/)).toBeVisible();await expect(page.locator('.interactive-scene')).toHaveAttribute('data-scene-id','welcome');await page.getByRole('button',{name:'Next scene',exact:true}).click();
 const operate=async locator=>{await locator.scrollIntoViewIfNeeded();if(touch)await locator.tap();else await locator.click();};
 for(const[id,label,count,target]of recipe){await expect(page.locator('.interactive-scene')).toHaveAttribute('data-scene-id',id);const next=page.getByRole('button',{name:'Next scene',exact:true});await expect(next).toBeDisabled();
  await page.getByRole('button',{name:'Show me',exact:true}).click();await expect(page.locator('.demonstration img')).toBeVisible();await page.getByRole('button',{name:'Next picture',exact:true}).click();await page.getByRole('button',{name:'Next picture',exact:true}).click();await expect(next).toBeDisabled();await expect(page.locator('[data-layer="completed"]')).toHaveCSS('display','none');await page.getByRole('button',{name:'Close example',exact:true}).click();
  if(id==='star-place'){await operate(page.getByRole('button',{name:'Round bun, copy 1',exact:true}));await operate(page.getByRole('button',{name:target,exact:true}));await expect(next).toBeDisabled();await expect(page.locator('.activity-feedback')).toContainText('points');}
  for(let n=1;n<=count;n++){await operate(page.getByRole('button',{name:`${label}, copy ${n}`,exact:true}));await operate(page.getByRole('button',{name:target,exact:true}));if(n<count){await expect(next).toBeDisabled();await expect(page.locator('[data-layer="completed"]')).toHaveCSS('display','none');}}
  await expect(next).toBeEnabled();await expect(page.locator('[data-layer="completed"]')).not.toHaveCSS('display','none');
  await page.waitForTimeout(inspect?250:0);await expect(page.locator('[data-layer="completed"]')).not.toHaveAttribute('transform',/.+/);
  if(inspect&&id==='five-for-the-table')await page.screenshot({path:`.superpowers/sdd/2026-11-11-interactive-story-pairs/bakery-evidence/journey-${edition}-${touch?'phone':'desktop'}-completed.png`,fullPage:true});
  await next.click();
 }
 await expect(page.locator('.interactive-ending')).toContainText('Their small jobs have made a big welcome.');
 if(edition==='together')await expect(page.locator('.discussion-prompt')).toHaveCount(4);else await expect(page.locator('.interactive-ending')).toContainText('Which group would you like');
 await page.getByRole('button',{name:'Previous scene',exact:true}).click();await expect(page.locator('[data-layer="completed"]')).not.toHaveCSS('display','none');await page.getByRole('button',{name:'Next scene',exact:true}).click();await page.getByRole('button',{name:'Bookshelf',exact:true}).click();
}
for(const edition of ['together','independent']){
 test(`Bakery ${edition} full production online journey and completed persistence`,async({page})=>{await download(page);await journey(page,edition,{inspect:true});await cardFor(page).getByRole('button',{name:edition==='together'?'Read Together':'Play by Myself',exact:true}).click();await page.getByRole('button',{name:'Resume story',exact:true}).click();await expect(page.locator('.interactive-ending')).toBeVisible();});
 test(`Bakery ${edition} full offline journey after reload`,async({page,context})=>{await download(page);await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await page.waitForFunction(()=>navigator.serviceWorker.controller);await context.setOffline(true);await page.reload();await expect(cardFor(page)).toContainText('Ready offline');await journey(page,edition);});
 test(`Bakery ${edition} touch-emulated phone and reduced-motion journey`,async({browser})=>{const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});const page=await context.newPage();await download(page);await journey(page,edition,{touch:true,inspect:true});await context.close();});
}
