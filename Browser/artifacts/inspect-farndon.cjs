const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
 const page=await browser.newPage({viewport:{width:1200,height:800}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const photoOnly=process.argv.includes('--photo');
 for(const view of photoOnly?['farndon','farndon-2']:['farndon','farndon-plan','farndon-site','farndon-2']){
  await page.goto('http://127.0.0.1:1829/aerial.html?view='+view);
  await page.waitForTimeout(1700);
  assert((await page.locator('#churtonNav').textContent()).includes('FARNDON'));
  await page.locator('#locationsButton').click();
  assert(await page.locator('#locationsPanel a[href="?view=farndon"]').isVisible());
  await page.locator('#locationsButton').click();
  await page.addStyleTag({content:'#previewNav,#layoutControls,#aerialHelp,#churtonNav{display:none!important}'});
  await page.screenshot({path:'Browser/artifacts/'+view+'.jpg',type:'jpeg',quality:82});
 }
 await page.goto('http://127.0.0.1:1829/explore.html?view=farndon');
 await page.waitForTimeout(1700);
 assert(!(await page.locator('body').textContent()).includes('grounds could not load'));
 await page.screenshot({path:'Browser/artifacts/farndon-walking.jpg',type:'jpeg',quality:80});
 if(!photoOnly){
 await page.setViewportSize({width:390,height:844});
 await page.goto('http://127.0.0.1:1829/aerial.html?view=farndon-plan');
 await page.waitForTimeout(1700);
 const nav=await page.locator('#churtonNav').boundingBox(),controls=await page.locator('#layoutControls').boundingBox();
 assert(nav.y+nav.height<controls.y,'Mobile photo navigation must clear layout controls');
 await page.screenshot({path:'Browser/artifacts/farndon-mobile.jpg',type:'jpeg',quality:80});
 }
 assert.deepEqual(errors,[]);
 console.log(photoOnly?'PASS: updated Farndon photo framing and walking view without browser errors.':'PASS: four Farndon aerial/photo views, Locations, walking, and mobile navigation without browser errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

