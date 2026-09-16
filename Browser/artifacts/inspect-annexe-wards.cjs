const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:900}}),errors=[];page.on('pageerror',error=>errors.push(error.message));
  for(const id of ['larkton-jodrell','tarvin-jarman','leighton-newton','oakmere','picton-carden']){
   await page.goto('http://127.0.0.1:1829/aerial.html?view='+id);
   await page.locator('#churtonNav.annexe-ward-navigation').waitFor({state:'visible'});
   await page.waitForTimeout(500);
   await page.screenshot({path:'Browser/artifacts/ward-'+id+'.jpg',type:'jpeg',quality:75});
   await page.getByRole('button',{name:'Locations',exact:true}).click();
   await page.locator('#locationsPanel a[href="?view='+id+'"]').scrollIntoViewIfNeeded();
   if(await page.locator('#locationsPanel a[href="?view='+id+'"]').getAttribute('aria-current')!=='page')throw Error('Missing current ward '+id);
  }
  await page.setViewportSize({width:390,height:844});
  await page.goto('http://127.0.0.1:1829/aerial.html?view=tarvin-jarman');
  await page.locator('#churtonNav.annexe-ward-navigation').waitFor({state:'visible'});
  await page.waitForTimeout(400);await page.screenshot({path:'Browser/artifacts/ward-mobile.jpg',type:'jpeg',quality:75});
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Mobile horizontal overflow');
  await page.setViewportSize({width:1200,height:900});
  for(const id of ['larkton-jodrell','tarvin-jarman','leighton-newton','oakmere','picton-carden']){
   await page.goto('http://127.0.0.1:1829/explore.html?view='+id);
   await page.waitForFunction(()=>!document.getElementById('look').disabled);
   if(await page.locator('#look').textContent()==='RELOAD ↗')throw Error('Walking view failed '+id);
   await page.waitForTimeout(300);
   await page.screenshot({path:'Browser/artifacts/ward-'+id+'-walk.jpg',type:'jpeg',quality:75});
  }
  if(errors.length)throw Error(errors.join('\n'));
  console.log('PASS: all five aerial and walking ward pages, current Locations links, and mobile layout render without page errors.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
