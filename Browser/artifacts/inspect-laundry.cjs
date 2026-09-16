const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:800}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const view of ['laundry','laundry-photo','laundry-plan']){
   await page.goto('http://127.0.0.1:1829/aerial.html?view='+view);
   await page.waitForTimeout(1800);
   await page.screenshot({path:'Browser/artifacts/'+view+'.png'});
  }
  await page.goto('http://127.0.0.1:1829/explore.html?view=laundry');
  await page.waitForTimeout(1800);await page.screenshot({path:'Browser/artifacts/laundry-walk.png'});
  await page.setViewportSize({width:390,height:844});
  await page.goto('http://127.0.0.1:1829/aerial.html?view=laundry');
  await page.waitForTimeout(1800);await page.screenshot({path:'Browser/artifacts/laundry-mobile.png'});
  if(errors.length)throw Error(errors.join('\n'));
  console.log('PASS: Laundry aerial, photo, plan, walk and portrait views render without browser errors.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
