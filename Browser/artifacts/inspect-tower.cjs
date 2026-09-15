const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:800,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const side of [1,2,3,4]){
   await page.goto('http://127.0.0.1:1829/aerial.html?view=tower-'+side);
   await page.waitForTimeout(1600);
   await page.addStyleTag({content:'#previewNav,#layoutControls,#aerialHelp,#churtonNav {display:none!important}'});
   await page.screenshot({path:'Browser/artifacts/tower-side-'+side+'.png'});
  }
  if(errors.length)throw Error(errors.join('\n'));
  console.log('PASS: all four tower photo views render without browser errors.');
 }finally{await browser.close();}
})();
