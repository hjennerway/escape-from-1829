const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:800}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:1829/explore.html?view=tower-twin-gables');
  await page.waitForFunction(()=>document.querySelector('#look')?.disabled===false);
  await page.locator('#locationsButton').click();
  if(await page.locator('#locationsPanel a[href="?view=tower-twin-gables"]').count()!==1)throw Error('Missing walking destination');
  await page.locator('#locationsButton').click();
  await page.screenshot({path:'Browser/artifacts/tower-twin-gables-walking.jpg',type:'jpeg',quality:70});
  await page.goto('http://127.0.0.1:1829/aerial.html?view=tower-twin-gables');
  await page.waitForTimeout(1000);
  if(await page.locator('#churtonNav a[href="?view=tower-twin-gables"]').count()!==1)throw Error('Missing photo navigation');
  await page.screenshot({path:'Browser/artifacts/tower-twin-gables-controls.jpg',type:'jpeg',quality:70});
  if(errors.length)throw Error(errors.join('\n'));console.log('PASS: aerial photo navigation and walking workshop destination render without browser errors.');
 }finally{await browser.close();}
})();
