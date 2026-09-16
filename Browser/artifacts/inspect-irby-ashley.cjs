const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:800}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const mobileOnly=process.argv.includes('--mobile');
  for(const view of mobileOnly?[]:['irby-ashley','irby-ashley-rear','irby-ashley-plan','irby-ashley-1','irby-ashley-3','irby-ashley-4']){
   await page.goto('http://127.0.0.1:1829/aerial.html?view='+view);
   await page.waitForTimeout(1600);
   assert(await page.locator('#churtonNav').isVisible());
   assert((await page.locator('#churtonNav').textContent()).includes('IRBY/ASHLEY'));
   await page.locator('#locationsButton').click();
   assert(await page.locator('#locationsPanel a[href="?view=irby-ashley"]').isVisible());
   await page.locator('#locationsButton').click();
   await page.addStyleTag({content:'#previewNav,#layoutControls,#aerialHelp,#churtonNav{display:none!important}'});
   await page.screenshot({path:'Browser/artifacts/'+view+'.jpg',type:'jpeg',quality:85});
  }
  if(!mobileOnly){
  await page.goto('http://127.0.0.1:1829/explore.html?view=irby-ashley-3');
  await page.waitForTimeout(1600);
  assert(!(await page.locator('body').textContent()).includes('grounds could not load'));
  await page.screenshot({path:'Browser/artifacts/irby-ashley-walking.jpg',type:'jpeg',quality:80});
  }
  await page.setViewportSize({width:390,height:844});
  await page.goto('http://127.0.0.1:1829/aerial.html?view=irby-ashley-plan');
  await page.waitForTimeout(1600);
  const links=await page.locator('#churtonNav').boundingBox(),controls=await page.locator('#layoutControls').boundingBox();
  assert(links.y+links.height<controls.y,'Photo links must clear the mobile layout controls');
  await page.screenshot({path:'Browser/artifacts/irby-ashley-mobile.jpg',type:'jpeg',quality:80});
  assert.deepEqual(errors,[]);
  console.log(mobileOnly?'PASS: portrait plan and unobstructed mobile photo navigation.':'PASS: six aerial/photo views, Locations entry, walking view and portrait plan render without browser errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
