const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  for(const view of ['farndon-corridor','farndon-corridor-plan','ward-corridors','ward-corridors-plan']){
   await page.goto('http://127.0.0.1:1829/aerial.html?view='+view,{waitUntil:'networkidle'});
   await page.screenshot({path:'Browser/artifacts/'+view+'.png'});
  }
  await page.goto('http://127.0.0.1:1829/explore.html?view=ward-corridors',{waitUntil:'networkidle'});
  await page.screenshot({path:'Browser/artifacts/ward-corridors-walk.png'});
    await page.setViewportSize({width:390,height:844});
  await page.goto('http://127.0.0.1:1829/aerial.html?view=ward-corridors',{waitUntil:'networkidle'});
  await page.locator('#locationsButton').click();
  if(!await page.locator('#locationsPanel a[href="?view=ward-corridors"]').isVisible())throw new Error('Missing ward corridor location');
  await page.locator('#locationsButton').click();
  const nav=await page.locator('#churtonNav').boundingBox(),controls=await page.locator('#layoutControls').boundingBox();
  if(nav.y+nav.height>=controls.y)throw new Error('Mobile corridor navigation overlaps layout controls');
  await page.screenshot({path:'Browser/artifacts/ward-corridors-mobile.png'});
  if(errors.length)throw new Error(errors.join('\n'));
  console.log(JSON.stringify({errors,checked:'Four aerial/plan views, walking view, mobile framing and Locations'}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
