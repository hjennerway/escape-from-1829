const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:800}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  for(const view of ['estates','estates-photo','estates-plan','estates-site']){
   await page.goto('http://127.0.0.1:1829/aerial.html?view='+view);
   await page.waitForTimeout(1800);
   assert(await page.locator('#churtonNav').isVisible());
   assert((await page.locator('#churtonNav').textContent()).includes('ESTATES DEPARTMENT'));
   await page.locator('#locationsButton').click();
   assert(await page.locator('#locationsPanel a[href="?view=estates"]').isVisible());
   await page.locator('#locationsButton').click();
   await page.addStyleTag({content:'#previewNav,#layoutControls,#aerialHelp,#churtonNav{display:none!important}'});
   await page.screenshot({path:'Browser/artifacts/'+view+'.jpg',type:'jpeg',quality:90});
  }
  await page.goto('http://127.0.0.1:1829/explore.html?view=estates');
  await page.waitForTimeout(1800);
  assert(!(await page.locator('body').textContent()).includes('grounds could not load'));
  await page.screenshot({path:'Browser/artifacts/estates-walking.jpg',type:'jpeg',quality:85});
  await page.setViewportSize({width:390,height:844});
  await page.goto('http://127.0.0.1:1829/aerial.html?view=estates-plan');
  await page.waitForTimeout(1800);
  const nav=await page.locator('#churtonNav').boundingBox(),controls=await page.locator('#layoutControls').boundingBox();
  assert(nav.y+nav.height<controls.y,'Photo links must clear the mobile layout controls');
  await page.screenshot({path:'Browser/artifacts/estates-mobile.jpg',type:'jpeg',quality:85});
  assert.deepEqual(errors,[]);
  console.log('PASS: Estates overview, photo, plan, site, walking and portrait views; Locations entry; unobstructed mobile navigation; no browser errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});