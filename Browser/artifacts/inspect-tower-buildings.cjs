const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:800}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const views=process.argv.length>2?process.argv.slice(2):['tower-buildings','tower-buildings-roofs','tower-roof-white-door','tower-roof-north','tower-roof-away','tower-buildings-1','tower-buildings-2','tower-buildings-3','tower-buildings-4','tower-buildings-plan'];
  for(const view of views){
   await page.goto('http://127.0.0.1:1829/aerial.html?view='+view);
   await page.waitForTimeout(1500);
   await page.addStyleTag({content:'#previewNav,#layoutControls,#aerialHelp,#churtonNav {display:none!important}'});
   await page.screenshot({path:'Browser/artifacts/'+view+'.jpg',type:'jpeg',quality:60});
  }
  if(errors.length)throw Error(errors.join('\n'));console.log('PASS: '+views.length+' tower complex views render without browser errors.');
 }finally{await browser.close();}
})();

