const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1224,height:918}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const view of process.argv.length>2?process.argv.slice(2):['outhouse','outhouse-1','outhouse-2','outhouse-3','outhouse-site']){
   await page.goto('http://127.0.0.1:1829/aerial.html?view='+view);
   await page.waitForFunction(()=>document.querySelector('canvas')?.width>300&&!document.getElementById('churtonNav')?.hidden,{},{timeout:60000});
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   await page.addStyleTag({content:'#previewNav,#layoutControls,#aerialHelp,#churtonNav{display:none!important}'});
   await page.screenshot({path:'Browser/artifacts/'+view+'.jpg',type:'jpeg',quality:85});
  }
  await page.goto('http://127.0.0.1:1829/explore.html?view=outhouse');
  await page.waitForFunction(()=>!document.getElementById('look')?.disabled,{},{timeout:60000});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  if(await page.locator('#look').count())console.log(await page.locator('#look').textContent());
  if(errors.length)throw Error(errors.join('\n'));
  console.log('PASS: outhouse aerial, three matched photo directions, site and walking views render without browser errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
